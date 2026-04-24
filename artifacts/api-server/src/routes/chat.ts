import { Router, type IRouter } from "express";
import axios from "axios";
import { rateLimit } from "express-rate-limit";
import { SendChatMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." },
});

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE_URL = "https://api.minimax.io/v1";

router.post("/chat/message", chatRateLimit, async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!MINIMAX_API_KEY) {
    res.status(500).json({ error: "Minimax API key not configured" });
    return;
  }

  const { messages, context } = parsed.data;

  const systemPrompt = `당신은 프랑스 공공데이터 포털(data.gouv.fr) 전문가이자 대한민국 공공데이터 정책 자문관입니다.
대한민국 정책결정자들이 프랑스의 공공데이터 정책을 이해하고 벤치마크로 활용할 수 있도록 돕습니다.

핵심 역할:
- 프랑스 공공데이터 포털의 철학, 운영 방식, 특징을 한국어로 명확하게 설명
- 한국(data.go.kr)과 프랑스(data.gouv.fr) 공공데이터 정책 비교 분석
- 데이터셋, 기관, API 서비스에 대한 구체적인 해설 제공
- 한국 공공데이터 정책 개선을 위한 시사점 도출

응답 원칙:
- 모든 응답은 한국어로 작성
- 정책적 시사점을 중심으로 실무적이고 구체적으로 설명
- 전문용어는 쉽게 풀어서 설명${context ? `\n\n현재 맥락:\n${context}` : ""}`;

  const minimaxMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role === "system" ? "system" : m.role, content: m.content })),
  ];

  try {
    const response = await axios.post(
      `${MINIMAX_BASE_URL}/chat/completions`,
      {
        model: "MiniMax-M1",
        messages: minimaxMessages,
        max_tokens: 2048,
        temperature: 0.7,
        thinking: {
          type: "enabled",
          budget_tokens: 2048,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${MINIMAX_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
    );

    const choice = response.data?.choices?.[0];
    const content = choice?.message?.content ?? "";
    const thinking = choice?.message?.thinking_content ?? null;

    res.json({
      content,
      role: "assistant",
      thinking,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Minimax API error");

    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 500;
      const detail = err.response?.data ?? err.message;
      req.log.error({ status, detail }, "Minimax API error detail");
    }

    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

export default router;
