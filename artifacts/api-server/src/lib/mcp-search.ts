import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";
import { createMinimaxMcpSession } from "./minimax-mcp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const MCP_ENDPOINT = "https://mcp.data.gouv.fr/mcp";
const DATAGOUV_BASE_URL = "https://www.data.gouv.fr/api/1";
const MINIMAX_MODEL = "MiniMax-M2.7";

export type SendFn = (event: string, data: unknown) => void;

function parseMcpSseResponse(rawText: string): unknown {
  const lines = rawText.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      try { return JSON.parse(line.slice(6)); } catch { /* continue */ }
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
        headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
        responseType: "text",
        timeout: 15000,
      }
    );
    const parsed = parseMcpSseResponse(res.data as string) as {
      result?: { content?: Array<{ text?: string }>; isError?: boolean };
      error?: { message?: string };
    } | null;
    if (parsed?.result && !parsed.result.isError) {
      const content = parsed.result.content;
      if (Array.isArray(content)) return content.map((c) => c.text ?? JSON.stringify(c)).join("\n");
      return JSON.stringify(parsed.result);
    }
    if (parsed?.error) throw new Error(parsed.error.message ?? "MCP error");
    throw new Error("Empty MCP response");
  } catch {
    return callFallbackApi(name, args);
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
        return JSON.stringify(
          (r.data?.data ?? []).map((d: { id: string; title: string; description?: string; organization?: { name: string }; resources?: unknown[]; tags?: string[] }) => ({
            id: d.id, title: d.title,
            description: (d.description ?? "").substring(0, 200),
            organization: d.organization?.name ?? null,
            resources_count: Array.isArray(d.resources) ? d.resources.length : 0,
            tags: (d.tags ?? []).slice(0, 5),
          }))
        );
      }
      case "search_dataservices": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/dataservices/`, { params: { q: args.query ?? "", page_size: args.page_size ?? 5 }, timeout: 10000 });
        return JSON.stringify(r.data?.data ?? []);
      }
      case "get_dataset_info": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/datasets/${args.dataset_id}/`, { timeout: 10000 });
        return JSON.stringify({
          id: r.data.id, title: r.data.title,
          description: (r.data.description ?? "").substring(0, 500),
          organization: r.data.organization?.name, license: r.data.license,
          resources: (r.data.resources ?? []).slice(0, 10).map((res: { id: string; title: string; format: string; url: string; filesize?: number }) => ({
            id: res.id, title: res.title, format: res.format, url: res.url, filesize: res.filesize,
          })),
        });
      }
      case "list_dataset_resources": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/datasets/${args.dataset_id}/resources/`, { params: { page_size: args.page_size ?? 10 }, timeout: 10000 });
        return JSON.stringify(r.data?.data ?? r.data ?? []);
      }
      case "get_resource_info": {
        const r = await axios.get(`${DATAGOUV_BASE_URL}/datasets/${args.dataset_id}/resources/${args.resource_id}/`, { timeout: 10000 });
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
        return JSON.stringify({ error: `Tool ${name} not implemented`, args });
    }
  } catch (err) {
    return JSON.stringify({ error: `Tool call failed: ${(err as Error).message}`, tool: name });
  }
}

export const ANTHROPIC_TOOLS: Anthropic.Messages.Tool[] = [
  { name: "search_datasets", description: "Search for datasets on data.gouv.fr by keyword.", input_schema: { type: "object", properties: { query: { type: "string" }, page_size: { type: "integer" } }, required: ["query"] } },
  { name: "search_dataservices", description: "Search for data services (APIs) on data.gouv.fr.", input_schema: { type: "object", properties: { query: { type: "string" }, page_size: { type: "integer" } }, required: ["query"] } },
  { name: "get_dataset_info", description: "Get detailed information about a specific dataset.", input_schema: { type: "object", properties: { dataset_id: { type: "string" } }, required: ["dataset_id"] } },
  { name: "list_dataset_resources", description: "List resource files in a dataset.", input_schema: { type: "object", properties: { dataset_id: { type: "string" }, page_size: { type: "integer" } }, required: ["dataset_id"] } },
  { name: "get_resource_info", description: "Get details about a specific resource file.", input_schema: { type: "object", properties: { dataset_id: { type: "string" }, resource_id: { type: "string" } }, required: ["dataset_id", "resource_id"] } },
  { name: "query_resource_data", description: "Query tabular data from a resource.", input_schema: { type: "object", properties: { resource_id: { type: "string" }, limit: { type: "integer" } }, required: ["resource_id"] } },
  { name: "get_dataservice_info", description: "Get details about a specific API data service.", input_schema: { type: "object", properties: { dataservice_id: { type: "string" } }, required: ["dataservice_id"] } },
  { name: "get_metrics", description: "Get overall portal statistics.", input_schema: { type: "object", properties: {}, required: [] } },
];

function mcpToolToAnthropic(tool: Tool): Anthropic.Messages.Tool {
  return {
    name: tool.name,
    description: tool.description ?? "",
    input_schema: (tool.inputSchema as Anthropic.Messages.Tool["input_schema"]) ?? {
      type: "object",
      properties: {},
      required: [],
    },
  };
}

const SYSTEM_PROMPT = `Please understand the user's question and respond using the provided MCP tool.
Please output the response in Korean.`;

export async function runMcpSearch(query: string, send: SendFn, signal?: AbortSignal): Promise<void> {
  if (!process.env.MINIMAX_API_KEY) throw new Error("MINIMAX_API_KEY가 설정되지 않았습니다.");

  const minimax = new Anthropic({
    baseURL: "https://api.minimax.io/anthropic",
    apiKey: process.env.MINIMAX_API_KEY,
  });

  // Attempt to connect to MiniMax MCP server for additional tools
  let minimaxMcpTools: Tool[] = [];
  let minimaxMcpClose: (() => Promise<void>) | null = null;
  let minimaxMcpCallTool: ((name: string, args: Record<string, unknown>) => Promise<string>) | null = null;
  const minimaxMcpToolNames = new Set<string>();

  try {
    const session = await createMinimaxMcpSession();
    minimaxMcpTools = session.tools;
    minimaxMcpClose = session.close;
    minimaxMcpCallTool = session.callTool;
    for (const t of minimaxMcpTools) minimaxMcpToolNames.add(t.name);
  } catch {
    // MiniMax MCP server unavailable — proceed with data.gouv.fr tools only
  }

  const allTools: Anthropic.Messages.Tool[] = [
    ...ANTHROPIC_TOOLS,
    ...minimaxMcpTools.map(mcpToolToAnthropic),
  ];

  type AnthropicMessage = Anthropic.Messages.MessageParam;
  const messages: AnthropicMessage[] = [{ role: "user", content: query }];

  const MAX_LOOPS = 8;
  let loops = 0;
  let toolCallCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  send("status", { step: "searching", message: "MiniMax M2.7 추론 및 데이터 수집 중..." });

  try {
    while (loops < MAX_LOOPS) {
      if (signal?.aborted) break;
      loops++;

      // Non-streaming call following MiniMax docs pattern
      const response = await minimax.messages.create({
        model: MINIMAX_MODEL,
        max_tokens: 5000,
        system: SYSTEM_PROMPT,
        tools: allTools,
        tool_choice: { type: "auto" },
        messages,
      });

      totalInputTokens += response.usage?.input_tokens ?? 0;
      totalOutputTokens += response.usage?.output_tokens ?? 0;
      send("usage", { inputTokens: totalInputTokens, outputTokens: totalOutputTokens });

      // Process all content blocks from the response
      const toolUseBlocks: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];
      let hasTextContent = false;

      for (const block of response.content) {
        if (block.type === "thinking") {
          send("thinking_start", {});
          send("thinking_delta", { content: block.thinking });
          send("thinking_stop", {});
        } else if (block.type === "tool_use") {
          toolUseBlocks.push({
            id: block.id,
            name: block.name,
            input: block.input as Record<string, unknown>,
          });
        } else if (block.type === "text") {
          if (!hasTextContent) {
            send("status", { step: "writing", message: "답변 작성 중..." });
          }
          hasTextContent = true;
          send("content", { content: block.text });
        }
      }

      // end_turn: final answer has been emitted
      if (response.stop_reason === "end_turn") break;

      // tool_use: execute tools and continue the agentic loop
      if (response.stop_reason === "tool_use" && toolUseBlocks.length > 0) {
        // ⚠️ Append full response.content (thinking + tool_use blocks) to preserve reasoning chain
        messages.push({ role: "assistant", content: response.content });

        const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

        for (const tool of toolUseBlocks) {
          toolCallCount++;
          send("tool_call", { name: tool.name, args: tool.input, callCount: toolCallCount });

          let result: string;
          if (minimaxMcpToolNames.has(tool.name) && minimaxMcpCallTool) {
            result = await minimaxMcpCallTool(tool.name, tool.input);
          } else {
            result = await callMcpTool(tool.name, tool.input);
          }

          let parsedResult: unknown = result;
          try { parsedResult = JSON.parse(result); } catch { /* keep string */ }
          send("tool_result", { name: tool.name, result: parsedResult, callCount: toolCallCount });

          toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: result });
        }

        messages.push({ role: "user", content: toolResults });
        send("status", { step: "searching", message: `도구 ${toolCallCount}회 호출 완료 · 계속 추론 중...` });
        continue;
      }

      // Fallback: prompt for final answer if no text was produced
      if (!hasTextContent) {
        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: "지금까지 수집한 정보를 바탕으로 한국어로 분석 결과를 작성해주세요." });
      } else {
        break;
      }
    }
  } finally {
    if (minimaxMcpClose) {
      await minimaxMcpClose().catch(() => {/* ignore cleanup errors */});
    }
  }
}
