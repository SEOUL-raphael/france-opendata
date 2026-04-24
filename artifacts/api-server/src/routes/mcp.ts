import { Router, type IRouter } from "express";
import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";
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
const MINIMAX_MODEL = "MiniMax-M2.7";

function getMinimaxClient(): Anthropic {
  if (!process.env.MINIMAX_API_KEY) {
    throw new Error("MINIMAX_API_KEY가 설정되지 않았습니다.");
  }
  return new Anthropic({
    baseURL: "https://api.minimax.io/anthropic",
    apiKey: process.env.MINIMAX_API_KEY,
  });
}

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

    const parsed = parseMcpSseResponse(res.data as string) as {
      result?: { content?: Array<{ text?: string; type?: string }>; isError?: boolean };
      error?: { message?: string };
    } | null;

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
      case "search_organizations": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/organizations/`, {
          params: { q: args.query ?? "", page_size: args.page_size ?? 5 },
          timeout: 10000,
        });
        return JSON.stringify(
          (r.data?.data ?? []).map((o: { id: string; name: string; description?: string; datasets?: { total?: number }; metrics?: { datasets?: number } }) => ({
            id: o.id, name: o.name,
            description: (o.description ?? "").substring(0, 200),
            datasets_count: o.datasets?.total ?? o.metrics?.datasets ?? 0,
          }))
        );
      }
      default:
        return JSON.stringify({ error: `Tool ${name} not implemented in fallback`, args });
    }
  } catch (err) {
    return JSON.stringify({ error: `Tool call failed: ${(err as Error).message}`, tool: name });
  }
}

const ANTHROPIC_TOOLS: Anthropic.Messages.Tool[] = [
  { name: "search_datasets", description: "Search for datasets on data.gouv.fr. IMPORTANT: data.gouv.fr is a French portal — the query MUST be in French (e.g., use 'population Paris' not '파리 인구', 'immobilier' not '부동산'). Try multiple French keyword variations for best results.", input_schema: { type: "object", properties: { query: { type: "string", description: "Search keywords in FRENCH only" }, page_size: { type: "integer", description: "Number of results (default 5, max 20)" } }, required: ["query"] } },
  { name: "search_dataservices", description: "Search for data services (APIs) on data.gouv.fr. IMPORTANT: query MUST be in French.", input_schema: { type: "object", properties: { query: { type: "string", description: "Search keywords in FRENCH only" }, page_size: { type: "integer" } }, required: ["query"] } },
  { name: "search_organizations", description: "Search for organizations (publishers) on data.gouv.fr. IMPORTANT: query MUST be in French. Use to find which ministries or agencies publish relevant data.", input_schema: { type: "object", properties: { query: { type: "string", description: "Organization name or type in FRENCH (e.g., 'ministère', 'INSEE', 'météo')" }, page_size: { type: "integer" } }, required: ["query"] } },
  { name: "get_dataset_info", description: "Get detailed information about a specific dataset including all its resources.", input_schema: { type: "object", properties: { dataset_id: { type: "string", description: "Dataset ID from search results" } }, required: ["dataset_id"] } },
  { name: "list_dataset_resources", description: "List all resource files in a dataset (CSV, JSON, XLS files with download URLs).", input_schema: { type: "object", properties: { dataset_id: { type: "string" }, page_size: { type: "integer" } }, required: ["dataset_id"] } },
  { name: "get_resource_info", description: "Get details about a specific resource file including format, size, URL, schema.", input_schema: { type: "object", properties: { dataset_id: { type: "string" }, resource_id: { type: "string" } }, required: ["dataset_id", "resource_id"] } },
  { name: "query_resource_data", description: "Query tabular data (CSV/XLS) from a resource. Use for exploring actual data values.", input_schema: { type: "object", properties: { resource_id: { type: "string" }, limit: { type: "integer" } }, required: ["resource_id"] } },
  { name: "get_dataservice_info", description: "Get details about a specific API data service.", input_schema: { type: "object", properties: { dataservice_id: { type: "string" } }, required: ["dataservice_id"] } },
  { name: "get_metrics", description: "Get overall portal statistics and dataset counts.", input_schema: { type: "object", properties: {}, required: [] } },
];

router.get("/mcp/tools", (_req, res) => {
  const minimaxConfigured = !!process.env.MINIMAX_API_KEY;
  res.json({
    tools: MCP_TOOLS_META,
    model: "MiniMax-M2.7",
    minimaxEnabled: minimaxConfigured,
    mcpEndpoint: MCP_ENDPOINT,
    status: "active",
  });
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

  const minimaxOk = !!process.env.MINIMAX_API_KEY;

  res.json({
    status: datagouv.status === "fulfilled" && mcpOk && minimaxOk ? "ok" : "degraded",
    datagouv: datagouv.status === "fulfilled" ? "ok" : "unreachable",
    mcp: mcpOk ? "ok" : "unreachable",
    minimax: minimaxOk ? "configured" : "missing",
    model: "MiniMax-M2.7",
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
  if (!process.env.MINIMAX_API_KEY) {
    res.status(500).json({ error: "MiniMax API 키가 설정되지 않았습니다." });
    return;
  }

  const query = rawQuery.trim();
  const minimax = getMinimaxClient();

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const systemPrompt = `You are a research assistant helping Korean policy makers explore France's open data portal (data.gouv.fr).

CRITICAL RULE: data.gouv.fr is entirely in French. All dataset titles, descriptions, and search indices are in French. You MUST always search using French keywords — never Korean or English.

## Available tools (use ALL that are relevant):
1. search_datasets — find datasets by French keyword (use multiple keyword variations)
2. search_dataservices — find API services by French keyword
3. search_organizations — find publisher ministries/agencies by French name
4. get_dataset_info — get full metadata + resource list for a dataset ID
5. list_dataset_resources — list downloadable files in a dataset
6. get_resource_info — get details of a specific file/resource
7. query_resource_data — preview actual tabular data from a resource
8. get_dataservice_info — get full details of an API service
9. get_metrics — get overall portal statistics

## Workflow — follow these steps in order:

### Step 1 — PLAN (before any tool call)
Analyze the user's question and write a search plan:
- Translate core concepts into 2–4 French keyword variations
- Decide which of the 9 tools to use and in what order
- Common Korean → French translations:
  인구/인구통계 → population, démographie, habitants, recensement
  부동산/주택 → immobilier, logement, foncier, habitat
  교통/이동 → transport, mobilité, trafic, déplacement
  환경/기후 → environnement, écologie, pollution, climat
  보건/의료 → santé, hôpital, médecin, maladie
  예산/재정 → budget, finance, dépenses, fiscalité
  범죄/치안 → criminalité, délinquance, sécurité, police
  교육 → éducation, école, enseignement, formation
  농업/식품 → agriculture, alimentation, agroalimentaire
  에너지 → énergie, électricité, consommation

### Step 2 — SEARCH BROADLY
- Call search_datasets with at least 2 different French keyword variations
- Call search_organizations to find which agencies publish relevant data
- If the topic involves APIs, also call search_dataservices

### Step 3 — DRILL DOWN
- For the top 2–3 most relevant datasets: call get_dataset_info
- Call list_dataset_resources to see what files are available
- If a CSV/JSON resource looks useful: call query_resource_data to preview real data
- For promising API services: call get_dataservice_info

### Step 4 — ANSWER
Write a comprehensive response in Korean: what datasets/APIs were found, their quality and coverage, which resources are most useful, and how Korean policy makers could apply them.`;

  type AnthropicMessage = Anthropic.Messages.MessageParam;
  const messages: AnthropicMessage[] = [
    { role: "user", content: query },
  ];

  try {
    const MAX_LOOPS = 8;
    let loops = 0;
    let toolCallCount = 0;

    send("status", { step: "searching", message: "MiniMax M2.7 추론 및 데이터 수집 중..." });

    // Agentic loop: stream for real-time display, then process final content blocks
    while (loops < MAX_LOOPS) {
      loops++;

      // On the last loop, remove tools so the model is forced to produce a final answer
      const stream = minimax.messages.stream({
        model: MINIMAX_MODEL,
        max_tokens: 20000,
        system: systemPrompt,
        tools: loops < MAX_LOOPS ? ANTHROPIC_TOOLS : undefined,
        tool_choice: loops < MAX_LOOPS ? { type: "auto" } : undefined,
        messages,
      });

      for await (const event of stream) {
        if (event.type === "content_block_start") {
          const block = event.content_block as { type: string; id?: string; name?: string };
          if (block.type === "thinking") send("thinking_start", {});
          else if (block.type === "tool_use") { send("thinking_stop", {}); }
          else if (block.type === "text") { send("thinking_stop", {}); send("status", { step: "writing", message: "답변 작성 중..." }); }
        } else if (event.type === "content_block_delta") {
          const delta = event.delta as { type: string; thinking?: string; text?: string };
          if (delta.type === "thinking_delta" && delta.thinking) send("thinking_delta", { content: delta.thinking });
          else if (delta.type === "text_delta" && delta.text) send("content", { content: delta.text });
        }
      }

      const message = await stream.finalMessage();

      // Process final content blocks — thinking / text / tool_use
      const toolUseBlocks: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];
      let hasTextContent = false;

      for (const block of message.content) {
        if (block.type === "thinking") {
          // already streamed above
        } else if (block.type === "text") {
          hasTextContent = true;
        } else if (block.type === "tool_use") {
          toolUseBlocks.push({ id: block.id, name: block.name, input: block.input as Record<string, unknown> });
        }
      }

      if (message.stop_reason === "end_turn") break;

      if (message.stop_reason === "tool_use" && toolUseBlocks.length > 0) {
        // Append full content (thinking + tool_use) to preserve reasoning chain
        messages.push({ role: "assistant", content: message.content });

        const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
        for (const tool of toolUseBlocks) {
          toolCallCount++;
          send("tool_call", { name: tool.name, args: tool.input, callCount: toolCallCount });

          const result = await callMcpTool(tool.name, tool.input);

          let parsedResult: unknown = result;
          try { parsedResult = JSON.parse(result); } catch { /* keep string */ }
          send("tool_result", { name: tool.name, result: parsedResult, callCount: toolCallCount });

          toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: result });
        }

        messages.push({ role: "user", content: toolResults });
        send("status", { step: "searching", message: `도구 ${toolCallCount}회 호출 완료 · 계속 추론 중...` });
        continue;
      }

      if (!hasTextContent) {
        messages.push({ role: "assistant", content: message.content });
        messages.push({ role: "user", content: "지금까지 수집한 정보를 바탕으로 한국어로 분석 결과를 작성해주세요." });
      } else {
        break;
      }
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
