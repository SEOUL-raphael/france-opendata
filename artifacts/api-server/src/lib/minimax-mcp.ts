import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const MINIMAX_MCP_CONFIG = {
  command: "uvx",
  args: ["minimax-coding-plan-mcp", "-y"],
  env: {
    MINIMAX_API_KEY: process.env.MINIMAX_API_KEY ?? "",
    MINIMAX_API_HOST: "https://api.minimax.io",
  },
};

export interface McpClientSession {
  client: Client;
  tools: Tool[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<string>;
  close: () => Promise<void>;
}

export async function createMinimaxMcpSession(): Promise<McpClientSession> {
  const transport = new StdioClientTransport({
    command: MINIMAX_MCP_CONFIG.command,
    args: MINIMAX_MCP_CONFIG.args,
    env: { ...process.env, ...MINIMAX_MCP_CONFIG.env } as Record<string, string>,
  });

  const client = new Client({ name: "france-opendata-agent", version: "1.0.0" });
  await client.connect(transport);

  const { tools } = await client.listTools();

  const callTool = async (name: string, args: Record<string, unknown>): Promise<string> => {
    const result = await client.callTool({ name, arguments: args });
    const content = result.content;
    if (Array.isArray(content)) {
      return content
        .map((c) => {
          if (typeof c === "object" && c !== null && "text" in c) return (c as { text: string }).text;
          return JSON.stringify(c);
        })
        .join("\n");
    }
    return JSON.stringify(result);
  };

  const close = async () => {
    await client.close();
  };

  return { client, tools, callTool, close };
}
