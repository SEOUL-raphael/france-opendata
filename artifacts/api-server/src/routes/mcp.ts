import { Router, type IRouter } from "express";
import axios from "axios";
import { rateLimit } from "express-rate-limit";

const router: IRouter = Router();

const mcpRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." },
});

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE_URL = "https://api.minimax.io/v1";
const DATAGOUV_BASE_URL = "https://www.data.gouv.fr/api/1";

router.post("/mcp/search", mcpRateLimit, async (req, res): Promise<void> => {
  const rawQuery = req.body?.query;
  if (!rawQuery || typeof rawQuery !== "string" || rawQuery.trim().length === 0) {
    res.status(400).json({ error: "query 파라미터가 필요합니다." });
    return;
  }
  if (rawQuery.length > 200) {
    res.status(400).json({ error: "query가 너무 깁니다. 200자 이내로 입력하세요." });
    return;
  }

  if (!MINIMAX_API_KEY) {
    res.status(500).json({ error: "AI API 키가 설정되지 않았습니다." });
    return;
  }

  const query = rawQuery.trim();

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send("status", { step: "searching", message: `data.gouv.fr에서 "${query}" 검색 중...` });

    const searchRes = await axios.get(`${DATAGOUV_BASE_URL}/datasets/`, {
      params: { q: query, page_size: 5, sort: "score" },
      timeout: 10000,
    });

    const datasets: Array<{
      id: string;
      title: string;
      description: string | null;
      organization: { name: string } | null;
      last_update: string | null;
      tags: string[];
      license: string | null;
      resources: unknown[];
    }> = searchRes.data?.data ?? [];
    const total: number = searchRes.data?.total ?? 0;

    send("tool_result", {
      query,
      total,
      datasets: datasets.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description ? d.description.substring(0, 300) : null,
        organization: d.organization?.name ?? null,
        last_update: d.last_update ?? null,
        tags: (d.tags ?? []).slice(0, 5),
        license: d.license ?? null,
        resources_count: Array.isArray(d.resources) ? d.resources.length : 0,
      })),
    });

    send("status", { step: "thinking", message: "AI가 정책적 시사점을 분석 중..." });

    const datasetContext = datasets
      .map(
        (d, i) =>
          `[${i + 1}] ${d.title}\n기관: ${d.organization?.name ?? "미상"}\n설명: ${(d.description ?? "").substring(0, 200)}\n라이선스: ${d.license ?? "미지정"}\n태그: ${(d.tags ?? []).slice(0, 5).join(", ")}`,
      )
      .join("\n\n");

    const systemPrompt = `당신은 프랑스 공공데이터 포털(data.gouv.fr) 전문가이자 대한민국 공공데이터 정책 자문관입니다.
대한민국 정책결정자들이 프랑스의 공공데이터 정책을 이해하고 벤치마크로 활용할 수 있도록 돕습니다.

응답 원칙:
- 모든 응답은 한국어로 작성
- 마크다운 형식으로 구조화된 분석 제공
- 실무적이고 구체적인 정책 제언 포함`;

    const userMessage = `검색어: "${query}"
data.gouv.fr에서 총 ${total}개의 데이터셋이 발견되었습니다. 상위 ${datasets.length}개를 분석합니다.

${datasetContext}

위 데이터셋들을 바탕으로 다음 사항을 분석해주세요:
1. **검색 결과 개요**: 발견된 데이터셋의 주요 특징과 분야
2. **프랑스 공공데이터 현황**: 해당 분야에서 프랑스의 데이터 공개 수준
3. **정책적 시사점**: 한국 정책 입안자를 위한 벤치마킹 포인트
4. **주목할 데이터셋**: 특히 참고할 만한 데이터셋과 이유`;

    const minimaxRes = await axios.post(
      `${MINIMAX_BASE_URL}/chat/completions`,
      {
        model: "MiniMax-M1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2048,
        temperature: 0.7,
        thinking: { type: "enabled", budget_tokens: 2048 },
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${MINIMAX_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        responseType: "stream",
        timeout: 90000,
      },
    );

    let buffer = "";

    await new Promise<void>((resolve, reject) => {
      minimaxRes.data.on("data", (chunk: Buffer) => {
        buffer += chunk.toString("utf-8");
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6)) as {
              choices?: Array<{
                delta?: { content?: string; thinking_content?: string };
                finish_reason?: string | null;
              }>;
            };
            const delta = json.choices?.[0]?.delta;
            if (!delta) continue;

            if (delta.thinking_content) {
              send("thinking", { content: delta.thinking_content });
            }
            if (delta.content) {
              send("content", { content: delta.content });
            }
          } catch {
            // skip malformed chunks
          }
        }
      });

      minimaxRes.data.on("end", resolve);
      minimaxRes.data.on("error", reject);
    });

    send("done", {});
    res.end();
  } catch (err) {
    req.log.error({ err }, "MCP search error");
    send("error", { message: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
    res.end();
  }
});

export default router;
