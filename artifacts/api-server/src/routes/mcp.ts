import { Router, type IRouter } from "express";
import axios from "axios";
import OpenAI from "openai";
import { rateLimit } from "express-rate-limit";

const router: IRouter = Router();

const mcpRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." },
});

const MCP_ENDPOINT = "https://mcp.data.gouv.fr/mcp";
const DATAGOUV_BASE_URL = "https://www.data.gouv.fr/api/1";
const MODEL = "gpt-4.1-mini";

// OpenAI client via Replit AI Integrations proxy
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export const MCP_TOOLS_META = [
  {
    name: "search_datasets",
    label: "데이터셋 검색",
    description: "키워드로 data.gouv.fr의 데이터셋을 검색합니다. 제목·설명·태그 기반으로 관련 데이터셋을 수집합니다.",
    endpoint: "GET /api/1/datasets/",
    params: ["query", "page_size"],
    source: "data.gouv.fr API v1",
  },
  {
    name: "search_dataservices",
    label: "API 서비스 검색",
    description: "공개된 API 서비스(데이터 서비스)를 키워드로 검색합니다.",
    endpoint: "GET /api/1/dataservices/",
    params: ["query", "page_size"],
    source: "data.gouv.fr API v1",
  },
  {
    name: "get_dataservice_info",
    label: "API 서비스 상세 조회",
    description: "특정 데이터 서비스의 메타데이터, 엔드포인트, 라이선스 정보를 가져옵니다.",
    endpoint: "GET /api/1/dataservices/{id}/",
    params: ["dataservice_id"],
    source: "data.gouv.fr API v1",
  },
  {
    name: "get_dataservice_openapi_spec",
    label: "OpenAPI 스펙 조회",
    description: "데이터 서비스의 OpenAPI(Swagger) 명세를 가져옵니다.",
    endpoint: "GET {base_api_url}/openapi.json",
    params: ["dataservice_id"],
    source: "data.gouv.fr API v1",
  },
  {
    name: "query_resource_data",
    label: "리소스 데이터 직접 조회",
    description: "테이블형 리소스(CSV·XLS 등)의 실제 데이터를 SQL 스타일로 조회합니다.",
    endpoint: "GET /api/1/datasets/{dataset_id}/resources/{resource_id}/data/",
    params: ["resource_id", "limit", "offset"],
    source: "data.gouv.fr Explore API",
  },
  {
    name: "get_dataset_info",
    label: "데이터셋 상세 조회",
    description: "특정 데이터셋의 메타데이터, 리소스 목록, 기관 정보, 라이선스 등을 가져옵니다.",
    endpoint: "GET /api/1/datasets/{id}/",
    params: ["dataset_id"],
    source: "data.gouv.fr API v1",
  },
  {
    name: "list_dataset_resources",
    label: "데이터셋 리소스 목록",
    description: "데이터셋에 포함된 리소스 파일 목록(CSV·JSON·XLS 등)과 다운로드 URL을 가져옵니다.",
    endpoint: "GET /api/1/datasets/{id}/resources/",
    params: ["dataset_id", "page", "page_size"],
    source: "data.gouv.fr API v1",
  },
  {
    name: "get_resource_info",
    label: "리소스 상세 조회",
    description: "개별 리소스 파일의 형식·크기·URL·스키마 정보를 가져옵니다.",
    endpoint: "GET /api/1/datasets/{dataset_id}/resources/{resource_id}/",
    params: ["dataset_id", "resource_id"],
    source: "data.gouv.fr API v1",
  },
  {
    name: "get_metrics",
    label: "포털 통계 조회",
    description: "data.gouv.fr 전체 데이터셋·기관·재사용 건수 등 플랫폼 지표를 가져옵니다.",
    endpoint: "GET /api/1/site/",
    params: [],
    source: "data.gouv.fr API v1",
  },
];

// Parse SSE-format response from MCP server
function parseMcpSseResponse(rawText: string): unknown {
  const lines = rawText.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      try {
        return JSON.parse(line.slice(6));
      } catch {
        // continue
      }
    }
  }
  return null;
}

async function callMcpTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    const res = await axios.post(
      MCP_ENDPOINT,
      { jsonrpc: "2.0", method: "tools/call", params: { name, arguments: args }, id: Date.now() },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        responseType: "text",
        timeout: 15000,
      }
    );

    const parsed = parseMcpSseResponse(res.data as string) as { result?: { content?: Array<{ text?: string; type?: string }>; isError?: boolean }; error?: { message?: string } } | null;

    if (parsed?.result && !parsed.result.isError) {
      const content = parsed.result.content;
      if (Array.isArray(content)) {
        return content.map((c) => c.text ?? JSON.stringify(c)).join("\n");
      }
      return JSON.stringify(parsed.result);
    }
    if (parsed?.error) {
      throw new Error(parsed.error.message ?? "MCP error");
    }
    throw new Error("Empty MCP response");
  } catch {
    return await callFallbackApi(name, args);
  }
}

async function callFallbackApi(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "search_datasets": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/datasets/`, {
          params: { q: args.query ?? "", page_size: args.page_size ?? 5 },
          timeout: 10000,
        });
        const data = r.data?.data ?? [];
        return JSON.stringify(
          data.map((d: { id: string; title: string; description?: string; organization?: { name: string }; resources?: unknown[]; tags?: string[] }) => ({
            id: d.id,
            title: d.title,
            description: (d.description ?? "").substring(0, 200),
            organization: d.organization?.name ?? null,
            resources_count: Array.isArray(d.resources) ? d.resources.length : 0,
            tags: (d.tags ?? []).slice(0, 5),
          }))
        );
      }
      case "search_dataservices": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/dataservices/`, {
          params: { q: args.query ?? "", page_size: args.page_size ?? 5 },
          timeout: 10000,
        });
        return JSON.stringify(r.data?.data ?? []);
      }
      case "get_dataset_info": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/datasets/${args.dataset_id}/`, { timeout: 10000 });
        return JSON.stringify({
          id: r.data.id,
          title: r.data.title,
          description: (r.data.description ?? "").substring(0, 500),
          organization: r.data.organization?.name,
          license: r.data.license,
          resources: (r.data.resources ?? []).slice(0, 10).map((res: { id: string; title: string; format: string; url: string; filesize?: number }) => ({
            id: res.id,
            title: res.title,
            format: res.format,
            url: res.url,
            filesize: res.filesize,
          })),
        });
      }
      case "list_dataset_resources": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/datasets/${args.dataset_id}/resources/`, {
          params: { page_size: args.page_size ?? 10 },
          timeout: 10000,
        });
        return JSON.stringify(r.data?.data ?? r.data ?? []);
      }
      case "get_resource_info": {
        const r = await axios.get(
          `${DATAGOUV_BASE_URL}/datasets/${args.dataset_id}/resources/${args.resource_id}/`,
          { timeout: 10000 }
        );
        return JSON.stringify(r.data);
      }
      case "get_metrics": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/site/`, { timeout: 8000 });
        return JSON.stringify(r.data?.metrics ?? r.data);
      }
      case "get_dataservice_info": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/dataservices/${args.dataservice_id}/`, { timeout: 10000 });
        return JSON.stringify(r.data);
      }
      default:
        return JSON.stringify({ error: `Tool ${name} not implemented in fallback`, args });
    }
  } catch (err) {
    return JSON.stringify({ error: `Tool call failed: ${(err as Error).message}`, tool: name });
  }
}

const OPENAI_TOOL_DEFS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_datasets",
      description: "Search for datasets on data.gouv.fr by keyword. Returns titles, organizations, tags, and resource counts.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query in French or English for best results" },
          page_size: { type: "integer", description: "Number of results (default 5, max 20)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_dataservices",
      description: "Search for data services (APIs) on data.gouv.fr.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          page_size: { type: "integer" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dataset_info",
      description: "Get detailed information about a specific dataset including all its resources.",
      parameters: {
        type: "object",
        properties: {
          dataset_id: { type: "string", description: "Dataset ID from search results" },
        },
        required: ["dataset_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_dataset_resources",
      description: "List all resource files in a dataset (CSV, JSON, XLS files with download URLs).",
      parameters: {
        type: "object",
        properties: {
          dataset_id: { type: "string" },
          page_size: { type: "integer" },
        },
        required: ["dataset_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_resource_info",
      description: "Get details about a specific resource file including format, size, URL, schema.",
      parameters: {
        type: "object",
        properties: {
          dataset_id: { type: "string" },
          resource_id: { type: "string" },
        },
        required: ["dataset_id", "resource_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_resource_data",
      description: "Query tabular data (CSV/XLS) from a resource. Use for exploring actual data values.",
      parameters: {
        type: "object",
        properties: {
          resource_id: { type: "string" },
          limit: { type: "integer" },
        },
        required: ["resource_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dataservice_info",
      description: "Get details about a specific API data service.",
      parameters: {
        type: "object",
        properties: {
          dataservice_id: { type: "string" },
        },
        required: ["dataservice_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_metrics",
      description: "Get overall portal statistics (total datasets, organizations, reuses counts).",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

router.get("/mcp/tools", (_req, res) => {
  res.json({ tools: MCP_TOOLS_META, model: MODEL, mcpEndpoint: MCP_ENDPOINT, status: "active" });
});

router.get("/mcp/health", async (_req, res) => {
  const [datagouv, mcp] = await Promise.allSettled([
    axios.get(`${DATAGOUV_BASE_URL}/site/`, { timeout: 5000 }),
    axios.post(
      MCP_ENDPOINT,
      {
        jsonrpc: "2.0",
        method: "initialize",
        params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "france-opendata", version: "1.0" } },
        id: 1,
      },
      {
        headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
        responseType: "text",
        timeout: 6000,
      }
    ),
  ]);

  let mcpOk = false;
  if (mcp.status === "fulfilled") {
    const parsed = parseMcpSseResponse(mcp.value.data as string) as { result?: unknown } | null;
    mcpOk = !!parsed?.result;
  }

  const aiOk = !!(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY);

  res.json({
    status: datagouv.status === "fulfilled" && mcpOk && aiOk ? "ok" : "degraded",
    datagouv: datagouv.status === "fulfilled" ? "ok" : "unreachable",
    mcp: mcpOk ? "ok" : "unreachable",
    minimax: aiOk ? "configured" : "missing",
    model: MODEL,
    mcpEndpoint: MCP_ENDPOINT,
  });
});

router.post("/mcp/search", mcpRateLimit, async (req, res): Promise<void> => {
  const rawQuery = req.body?.query;
  if (!rawQuery || typeof rawQuery !== "string" || rawQuery.trim().length === 0) {
    res.status(400).json({ error: "query 파라미터가 필요합니다." });
    return;
  }
  if (rawQuery.length > 500) {
    res.status(400).json({ error: "query가 너무 깁니다. 500자 이내로 입력하세요." });
    return;
  }
  if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    res.status(500).json({ error: "AI API가 설정되지 않았습니다." });
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

  const systemPrompt = `당신은 프랑스 공공데이터 포털(data.gouv.fr) 전문가이자 대한민국 공공데이터 정책 자문관입니다.
사용자의 자연어 질문을 이해하고, 제공된 도구를 사용해 data.gouv.fr에서 관련 데이터를 검색·조회하세요.
필요한 도구를 순서대로 호출하여 충분한 정보를 수집한 후, 한국어로 구조화된 분석을 제공하세요.

응답 원칙:
- 모든 응답은 한국어로 작성
- 마크다운 형식으로 구조화된 분석 제공
- 실무적이고 구체적인 내용 포함
- 발견한 데이터셋의 ID와 제목을 명시
- 바로 활용 가능한 리소스(표·CSV)가 있으면 강조`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ];

  try {
    send("status", { step: "thinking", message: "MCP 도구를 선택하고 데이터를 수집 중..." });

    const MAX_LOOPS = 6;
    let loops = 0;
    let toolCallCount = 0;

    // Agentic tool-call loop
    while (loops < MAX_LOOPS) {
      loops++;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages,
        tools: OPENAI_TOOL_DEFS,
        tool_choice: loops >= MAX_LOOPS ? "none" : "auto",
        max_completion_tokens: 4096,
      });

      const choice = response.choices[0];
      if (!choice?.message) break;

      const assistantMsg = choice.message;
      messages.push(assistantMsg);

      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        break;
      }

      for (const toolCall of assistantMsg.tool_calls) {
        toolCallCount++;
        const toolName = toolCall.function.name;
        let toolArgs: Record<string, unknown> = {};
        try { toolArgs = JSON.parse(toolCall.function.arguments); } catch { /* ignore */ }

        send("tool_call", { name: toolName, args: toolArgs, callCount: toolCallCount });

        const result = await callMcpTool(toolName, toolArgs);

        let parsedResult: unknown = result;
        try { parsedResult = JSON.parse(result); } catch { /* keep string */ }

        send("tool_result", { name: toolName, result: parsedResult, callCount: toolCallCount });

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    }

    send("status", { step: "thinking", message: "분석 결과 작성 중..." });

    // Streaming final answer
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages,
      max_completion_tokens: 3000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) send("content", { content });
    }

    send("done", {});
    res.end();
  } catch (err) {
    const msg = (err as Error).message ?? "알 수 없는 오류";
    send("error", { message: `분석 중 오류가 발생했습니다: ${msg}` });
    res.end();
  }
});

export default router;
