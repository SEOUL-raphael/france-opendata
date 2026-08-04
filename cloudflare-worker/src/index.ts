// france-opendata Cloudflare Worker
// Proxies MiniMax AI requests with data.gouv.fr tool-calling loop.
// Response: POST /api/chat → { message, toolCalls }

export interface Env {
  MINIMAX_API_KEY: string;
  AI_INTEGRATIONS_OPENAI_BASE_URL: string; // e.g. https://api.minimax.io/v1
  AI_MODEL: string; // e.g. MiniMax-M2.7
  ALLOWED_ORIGIN: string; // e.g. https://username.github.io
}

// ─── CORS ────────────────────────────────────────────────────────────────────

function getCorsHeaders(origin: string, allowed: string): HeadersInit {
  const allow =
    origin.includes("github.io") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin === allowed
      ? origin
      : allowed;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

// ─── System prompt (dynamic — KST date injected at runtime) ──────────────────

function buildSystemPrompt(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const dateStr = kst.toISOString().slice(0, 10);
  return `당신은 프랑스 공공데이터 포털(data.gouv.fr) 전문 분석가입니다.
오늘 날짜(KST): ${dateStr}

제공된 도구를 활용해 사용자의 질문을 분석하고, 관련 데이터셋과 API 서비스를 찾아 한국어로 상세히 설명해 주세요.
응답은 반드시 한국어로 작성하세요.
도구를 적극적으로 활용하여 실제 데이터를 수집한 후 답변하세요.`;
}

// ─── OpenAI-format tool definitions ──────────────────────────────────────────

interface OAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
}

const TOOLS: OAITool[] = [
  {
    type: "function",
    function: {
      name: "search_datasets",
      description:
        "Search for datasets on data.gouv.fr by keyword. Returns id, slug, page URL, title, description, organization, and resource count.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords (French or English)" },
          page_size: { type: "number", description: "Number of results (default 5, max 20)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dataset_info",
      description:
        "Get detailed metadata for a specific dataset: description, organization, license, and list of resources.",
      parameters: {
        type: "object",
        properties: {
          dataset_id: { type: "string", description: "Dataset ID or slug from search results" },
        },
        required: ["dataset_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_dataset_resources",
      description: "List downloadable resource files inside a dataset (CSV, JSON, XLS, etc.).",
      parameters: {
        type: "object",
        properties: {
          dataset_id: { type: "string", description: "Dataset ID or slug" },
          page_size: { type: "number", description: "Number of resources to return (default 10)" },
        },
        required: ["dataset_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_resource_info",
      description: "Get details about a specific resource file: format, size, download URL, schema.",
      parameters: {
        type: "object",
        properties: {
          dataset_id: { type: "string", description: "Dataset ID" },
          resource_id: { type: "string", description: "Resource ID" },
        },
        required: ["dataset_id", "resource_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_dataservices",
      description: "Search for public API services (dataservices) on data.gouv.fr.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords" },
          page_size: { type: "number", description: "Number of results (default 5)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dataservice_info",
      description: "Get metadata for a specific API data service: endpoint, license, OpenAPI spec URL.",
      parameters: {
        type: "object",
        properties: {
          dataservice_id: { type: "string", description: "Dataservice ID" },
        },
        required: ["dataservice_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_organizations",
      description: "Search for organizations (data publishers) on data.gouv.fr.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Organization name or keyword" },
          page_size: { type: "number", description: "Number of results (default 5)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_resource_data",
      description: "Query tabular data (CSV/XLS) from a dataset resource using the data.gouv.fr Explore API.",
      parameters: {
        type: "object",
        properties: {
          resource_id: { type: "string", description: "Resource ID" },
          limit: { type: "number", description: "Number of rows to return (default 10)" },
        },
        required: ["resource_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_metrics",
      description: "Get overall portal statistics: total datasets, organizations, reuses, and dataservices.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

// ─── data.gouv.fr API calls ───────────────────────────────────────────────────

const DATAGOUV = "https://www.data.gouv.fr/api/1";

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "search_datasets": {
        const params = new URLSearchParams({
          q: String(args.query ?? ""),
          page_size: String(args.page_size ?? 5),
        });
        const r = await fetch(`${DATAGOUV}/datasets/?${params}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as {
          data?: Array<{
            id: string;
            slug?: string;
            page?: string;
            title: string;
            description?: string;
            organization?: { name: string };
            resources?: unknown[];
            tags?: string[];
          }>;
        };
        return JSON.stringify(
          (data.data ?? []).map((d) => ({
            id: d.id,
            slug: d.slug ?? null,
            page: d.page ?? null,
            title: d.title,
            description: (d.description ?? "").substring(0, 200),
            organization: d.organization?.name ?? null,
            resources_count: Array.isArray(d.resources) ? d.resources.length : 0,
            tags: (d.tags ?? []).slice(0, 5),
          }))
        );
      }

      case "get_dataset_info": {
        const r = await fetch(`${DATAGOUV}/datasets/${args.dataset_id}/`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = (await r.json()) as {
          id: string;
          slug?: string;
          page?: string;
          title: string;
          description?: string;
          organization?: { name: string };
          license?: string;
          resources?: Array<{ id: string; title: string; format: string; url: string; filesize?: number }>;
        };
        return JSON.stringify({
          id: d.id,
          slug: d.slug ?? null,
          page: d.page ?? null,
          title: d.title,
          description: (d.description ?? "").substring(0, 500),
          organization: d.organization?.name ?? null,
          license: d.license ?? null,
          resources: (d.resources ?? []).slice(0, 10).map((res) => ({
            id: res.id,
            title: res.title,
            format: res.format,
            url: res.url,
            filesize: res.filesize ?? null,
          })),
        });
      }

      case "list_dataset_resources": {
        const params = new URLSearchParams({ page_size: String(args.page_size ?? 10) });
        const r = await fetch(`${DATAGOUV}/datasets/${args.dataset_id}/resources/?${params}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { data?: unknown } | unknown[];
        return JSON.stringify(Array.isArray(data) ? data : (data as { data?: unknown }).data ?? data);
      }

      case "get_resource_info": {
        const r = await fetch(
          `${DATAGOUV}/datasets/${args.dataset_id}/resources/${args.resource_id}/`
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return JSON.stringify(await r.json());
      }

      case "search_dataservices": {
        const params = new URLSearchParams({
          q: String(args.query ?? ""),
          page_size: String(args.page_size ?? 5),
        });
        const r = await fetch(`${DATAGOUV}/dataservices/?${params}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { data?: unknown[] };
        return JSON.stringify(data.data ?? []);
      }

      case "get_dataservice_info": {
        const r = await fetch(`${DATAGOUV}/dataservices/${args.dataservice_id}/`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return JSON.stringify(await r.json());
      }

      case "search_organizations": {
        const params = new URLSearchParams({
          q: String(args.query ?? ""),
          page_size: String(args.page_size ?? 5),
        });
        const r = await fetch(`${DATAGOUV}/organizations/?${params}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as {
          data?: Array<{
            id: string;
            name: string;
            description?: string;
            datasets?: { total?: number };
            metrics?: { datasets?: number };
          }>;
        };
        return JSON.stringify(
          (data.data ?? []).map((o) => ({
            id: o.id,
            name: o.name,
            description: (o.description ?? "").substring(0, 200),
            datasets_count: o.datasets?.total ?? o.metrics?.datasets ?? 0,
          }))
        );
      }

      case "query_resource_data": {
        const params = new URLSearchParams({ limit: String(args.limit ?? 10) });
        const r = await fetch(
          `${DATAGOUV}/datasets/r/${args.resource_id}/?${params}`
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        // Return first 2000 chars to avoid huge payloads
        return text.substring(0, 2000);
      }

      case "get_metrics": {
        const r = await fetch(`${DATAGOUV}/site/`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { metrics?: unknown };
        return JSON.stringify(data.metrics ?? data);
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: `Tool ${name} failed: ${(err as Error).message}` });
  }
}

// ─── OpenAI chat message types ────────────────────────────────────────────────

interface OAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

interface OAIResponse {
  choices: Array<{
    message: OAIMessage;
    finish_reason: "stop" | "tool_calls" | "length" | string;
  }>;
}

// ─── Collected tool call (for response) ──────────────────────────────────────

interface CollectedToolCall {
  name: string;
  arguments: Record<string, unknown>;
  result: string;
}

// ─── Main worker handler ──────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const corsHeaders = getCorsHeaders(origin, env.ALLOWED_ORIGIN);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Health check — same shape as the Replit /api/mcp/health endpoint
    if (url.pathname === "/api/health" && request.method === "GET") {
      let datagouv = "unreachable";
      try {
        const r = await fetch(`${DATAGOUV}/site/`, {
          signal: AbortSignal.timeout(5000),
        });
        if (r.ok) datagouv = "ok";
      } catch {
        /* stays unreachable */
      }
      return Response.json(
        {
          status: "ok",
          datagouv,
          mcp: "ok",
          minimax: env.MINIMAX_API_KEY ? "configured" : "missing",
          model: env.AI_MODEL || "MiniMax-M2.7",
          mcpEndpoint: "cloudflare-worker",
        },
        { headers: corsHeaders }
      );
    }

    // Main chat endpoint
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env, corsHeaders);
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
} satisfies ExportedHandler<Env>;

// ─── SSE helpers ─────────────────────────────────────────────────────────────

type SseWriter = (event: string, data: unknown) => void;

function makeSseStream(
  corsHeaders: HeadersInit,
  run: (send: SseWriter) => Promise<void>
): Response {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  const send: SseWriter = (event, data) => {
    const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    writer.write(encoder.encode(chunk)).catch(() => {/* ignore closed stream */});
  };

  // Run the agentic loop in the background; close stream when done
  run(send)
    .catch((err: unknown) => {
      send("error", { message: `분석 중 오류: ${(err as Error).message}` });
    })
    .finally(() => {
      writer.close().catch(() => {/* already closed */});
    });

  return new Response(readable, {
    headers: {
      ...(corsHeaders as Record<string, string>),
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

// ─── Chat handler (SSE streaming) ────────────────────────────────────────────

async function handleChat(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  let body: { query?: string };
  try {
    body = (await request.json()) as { query?: string };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  const rawQuery = body.query;
  if (!rawQuery || typeof rawQuery !== "string" || rawQuery.trim().length === 0) {
    return Response.json({ error: "query 파라미터가 필요합니다." }, { status: 400, headers: corsHeaders });
  }
  if (rawQuery.length > 500) {
    return Response.json({ error: "query가 너무 깁니다. 500자 이내로 입력하세요." }, { status: 400, headers: corsHeaders });
  }

  const apiKey = env.MINIMAX_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "MINIMAX_API_KEY가 설정되지 않았습니다. wrangler secret put MINIMAX_API_KEY 를 실행하세요." },
      { status: 500, headers: corsHeaders }
    );
  }

  const baseUrl = (env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.minimax.io/v1").replace(/\/$/, "");
  const model = env.AI_MODEL || "MiniMax-M2.7";
  const query = rawQuery.trim();

  return makeSseStream(corsHeaders, async (send) => {
    const messages: OAIMessage[] = [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: query },
    ];

    send("status", { step: "searching", message: "AI 추론 시작 중..." });

    const MAX_LOOPS = 50;
    let loops = 0;
    let finalContent = "";
    let callCount = 0;

    while (loops < MAX_LOOPS) {
      loops++;

      const aiRes = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          messages,
          tools: TOOLS,
          tool_choice: "auto",
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        send("error", { message: `AI API 오류 (${aiRes.status}): ${errText.substring(0, 200)}` });
        return;
      }

      const aiData = (await aiRes.json()) as OAIResponse;
      const choice = aiData.choices?.[0];
      if (!choice) {
        send("error", { message: "AI 응답이 없습니다." });
        return;
      }

      const assistantMsg = choice.message;
      const finishReason = choice.finish_reason;

      // Natural completion
      if (finishReason === "stop" || !assistantMsg.tool_calls?.length) {
        finalContent = assistantMsg.content ?? "";
        break;
      }

      // Tool calls — stream each one immediately
      if (finishReason === "tool_calls" && assistantMsg.tool_calls?.length) {
        messages.push({
          role: "assistant",
          content: assistantMsg.content ?? null,
          tool_calls: assistantMsg.tool_calls,
        });

        for (const tc of assistantMsg.tool_calls) {
          callCount++;
          let parsedArgs: Record<string, unknown> = {};
          try {
            parsedArgs = JSON.parse(tc.function.arguments) as Record<string, unknown>;
          } catch { /* keep empty */ }

          // Emit tool_call immediately so the UI shows it
          send("tool_call", { name: tc.function.name, args: parsedArgs, callCount });
          send("status", { step: "searching", message: `도구 실행 중: ${tc.function.name}` });

          const rawResult = await executeTool(tc.function.name, parsedArgs);

          // Try to parse result JSON for richer UI display
          let parsedResult: unknown = rawResult;
          try { parsedResult = JSON.parse(rawResult); } catch { /* keep string */ }

          // Emit result so the UI can expand it immediately
          send("tool_result", { name: tc.function.name, callCount, result: parsedResult });

          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: rawResult,
          });
        }

        send("status", { step: "thinking", message: "결과 분석 중..." });
        continue;
      }

      // Unexpected finish reason — treat as done
      finalContent = assistantMsg.content ?? "";
      break;
    }

    // Safety cap reached — ask model to summarise what it collected
    if (loops >= MAX_LOOPS && !finalContent) {
      send("status", { step: "thinking", message: "수집된 정보를 바탕으로 최종 정리 중..." });
      messages.push({
        role: "user",
        content:
          "지금까지 수집한 모든 정보를 바탕으로 한국어로 종합 분석 결과를 작성해주세요. 더 이상 도구를 호출하지 말고 최종 답변만 작성하세요.",
      });

      const summaryRes = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, max_tokens: 8192, messages }),
      });

      if (summaryRes.ok) {
        const summaryData = (await summaryRes.json()) as OAIResponse;
        finalContent = summaryData.choices?.[0]?.message?.content ?? "";
      }
    }

    send("content", { content: finalContent });
    send("done", {});
  });
}
