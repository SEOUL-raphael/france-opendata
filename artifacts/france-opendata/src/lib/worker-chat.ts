const workerUrl = (import.meta.env.VITE_WORKER_URL ?? "").replace(/\/$/, "");

interface WorkerEvent {
  event: string;
  data: Record<string, unknown>;
}

function parseErrorResponse(status: number, body: string): string {
  try {
    const payload = JSON.parse(body) as { error?: string };
    if (payload.error) return payload.error;
  } catch {
    // Keep the generic message when the response is not JSON.
  }
  return `분석 서버 오류 (${status})`;
}

/**
 * Sends a policy-analysis prompt to the Cloudflare Worker and returns the
 * final AI response. The Worker keeps API credentials outside the browser.
 */
export async function requestWorkerAnalysis(
  query: string,
  signal?: AbortSignal,
): Promise<string> {
  if (!workerUrl) {
    throw new Error("분석 서버 주소가 설정되지 않았습니다.");
  }

  const response = await fetch(`${workerUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!response.ok) {
    throw new Error(parseErrorResponse(response.status, await response.text()));
  }
  if (!response.body) {
    throw new Error("분석 서버의 응답 스트림을 받을 수 없습니다.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "";
  let content = "";

  const processEvent = ({ event, data }: WorkerEvent) => {
    if (event === "error") {
      throw new Error((data.message as string) ?? "분석 중 오류가 발생했습니다.");
    }
    if (event === "content") {
      content += (data.content as string) ?? "";
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventName = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(line.slice(6)) as Record<string, unknown>;
        } catch {
          eventName = "";
          continue;
        }
        processEvent({ event: eventName, data });
        eventName = "";
      }
    }
  }

  return content;
}