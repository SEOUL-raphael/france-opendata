import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { runMcpSearch } from "./lib/mcp-search";

export function attachWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/api/ws/search" });

  wss.on("connection", (ws: WebSocket) => {
    let abortController: AbortController | null = null;

    ws.on("message", async (raw) => {
      // Cancel any running search
      abortController?.abort();
      abortController = new AbortController();

      let query: string;
      try {
        const msg = JSON.parse(raw.toString()) as { query?: string };
        query = (msg.query ?? "").trim();
      } catch {
        ws.send(JSON.stringify({ event: "error", data: { message: "메시지 파싱 오류" } }));
        return;
      }

      if (!query) {
        ws.send(JSON.stringify({ event: "error", data: { message: "query가 비어있습니다." } }));
        return;
      }
      if (query.length > 500) {
        ws.send(JSON.stringify({ event: "error", data: { message: "query가 너무 깁니다." } }));
        return;
      }
      if (!process.env.MINIMAX_API_KEY) {
        ws.send(JSON.stringify({ event: "error", data: { message: "MiniMax API 키가 설정되지 않았습니다." } }));
        return;
      }

      const send = (event: string, data: unknown) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ event, data }));
        }
      };

      try {
        await runMcpSearch(query, send, abortController.signal);
        send("done", {});
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        send("error", { message: `오류: ${(err as Error).message}` });
      }
    });

    ws.on("close", () => {
      abortController?.abort();
    });
  });
}
