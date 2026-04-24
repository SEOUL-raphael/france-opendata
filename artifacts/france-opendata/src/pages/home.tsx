import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "wouter";
import {
  Search,
  Database,
  Building2,
  Layers,
  Repeat,
  ArrowRight,
  Loader2,
  Brain,
  Cpu,
  ChevronDown,
  ChevronUp,
  Wrench,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  Zap,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePortalStats } from "@/hooks/use-datagouv";

const MCP_EXAMPLES = [
  {
    label: "파리 인구 관련 데이터셋을 찾아주고, 바로 조회 가능한 표 형식 리소스가 있으면 추천해줘.",
    searchTerm: "paris population recensement",
  },
  {
    label: "프랑스 부동산 가격 데이터를 찾고, 먼저 어떤 데이터셋부터 살펴보면 좋은지 요약해줘.",
    searchTerm: "prix immobilier foncier transactions",
  },
  {
    label: "파리의 최근 인구 데이터를 얻으려면 어떤 dataset/resource를 봐야 하는지 단계별로 알려줘.",
    searchTerm: "paris population statistiques demographiques",
  },
];

interface McpToolMeta {
  name: string;
  label: string;
  description: string;
  endpoint: string;
  params: string[];
  source: string;
}

interface McpHealthData {
  status: string;
  datagouv: string;
  mcp: string;
  openai?: string;
  minimax: string;
  model: string;
  synthesisModel?: string;
  minimaxEnabled?: boolean;
  mcpEndpoint: string;
}

interface McpToolCall {
  name: string;
  args: Record<string, unknown>;
  callCount: number;
  result?: unknown;
}

interface DatasetCard {
  id: string;
  title: string;
  organization?: string;
  url: string;
}

interface TokenUsage {
  input: number;
  output: number;
}

interface McpSearchState {
  status: "idle" | "searching" | "thinking" | "writing" | "done" | "error";
  statusMessage: string;
  toolCalls: McpToolCall[];
  thinking: string;
  isThinking: boolean;
  content: string;
  errorMessage: string | null;
  datasets: DatasetCard[];
  tokenUsage: TokenUsage;
}

function extractDatasetsFromResult(toolName: string, result: unknown): DatasetCard[] {
  if (!["search_datasets", "get_dataset_info", "list_dataset_resources"].includes(toolName)) return [];

  try {
    if (Array.isArray(result)) {
      return (result as Array<Record<string, unknown>>)
        .filter((d) => d.id && d.title)
        .map((d) => ({
          id: String(d.id),
          title: String(d.title),
          organization: d.organization ? String(d.organization) : undefined,
          url: `https://www.data.gouv.fr/datasets/${d.id}`,
        }));
    }
    if (result && typeof result === "object" && !Array.isArray(result)) {
      const d = result as Record<string, unknown>;
      if (d.id && d.title) {
        return [{ id: String(d.id), title: String(d.title), organization: d.organization ? String(d.organization) : undefined, url: `https://www.data.gouv.fr/datasets/${d.id}` }];
      }
    }
    if (typeof result === "string") {
      const datasets: DatasetCard[] = [];
      const lines = result.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const titleMatch = lines[i].match(/^\d+\.\s+(.+)$/);
        if (titleMatch) {
          const title = titleMatch[1].trim();
          let id = "";
          let org = "";
          for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
            const idMatch = lines[j].match(/ID:\s*(\S+)/);
            const orgMatch = lines[j].match(/Organization:\s*(.+)$/);
            if (idMatch) id = idMatch[1];
            if (orgMatch) org = orgMatch[1].trim();
            if (lines[j].trim() === "" && id) break;
          }
          if (id && title) {
            datasets.push({ id, title, organization: org || undefined, url: `https://www.data.gouv.fr/datasets/${id}` });
          }
        }
      }
      return datasets;
    }
  } catch {
    // ignore
  }
  return [];
}

function deduplicateDatasets(datasets: DatasetCard[]): DatasetCard[] {
  const seen = new Set<string>();
  return datasets.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

const INITIAL_MCP_STATE: McpSearchState = {
  status: "idle",
  statusMessage: "",
  toolCalls: [],
  thinking: "",
  isThinking: false,
  content: "",
  errorMessage: null,
  datasets: [],
  tokenUsage: { input: 0, output: 0 },
};

function useMcpSearch() {
  const [state, setState] = useState<McpSearchState>(INITIAL_MCP_STATE);
  const wsRef = useRef<WebSocket | null>(null);

  const handleEvent = useCallback((event: string, data: Record<string, unknown>) => {
    if (event === "status") {
      setState((prev) => ({
        ...prev,
        status: (data.step as McpSearchState["status"]) ?? "thinking",
        statusMessage: (data.message as string) ?? "",
      }));
    } else if (event === "tool_call") {
      setState((prev) => ({
        ...prev,
        status: "searching",
        statusMessage: `MCP 도구 호출: ${data.name as string}`,
        toolCalls: [
          ...prev.toolCalls,
          {
            name: data.name as string,
            args: (data.args as Record<string, unknown>) ?? {},
            callCount: (data.callCount as number) ?? prev.toolCalls.length + 1,
          },
        ],
      }));
    } else if (event === "tool_result") {
      const extracted = extractDatasetsFromResult(data.name as string, data.result);
      setState((prev) => ({
        ...prev,
        toolCalls: prev.toolCalls.map((tc) =>
          tc.callCount === (data.callCount as number)
            ? { ...tc, result: data.result }
            : tc
        ),
        datasets: extracted.length > 0
          ? deduplicateDatasets([...prev.datasets, ...extracted])
          : prev.datasets,
      }));
    } else if (event === "usage") {
      setState((prev) => ({
        ...prev,
        tokenUsage: {
          input: (data.inputTokens as number) ?? prev.tokenUsage.input,
          output: (data.outputTokens as number) ?? prev.tokenUsage.output,
        },
      }));
    } else if (event === "thinking_start") {
      setState((prev) => ({ ...prev, status: "thinking", isThinking: true }));
    } else if (event === "thinking_delta") {
      setState((prev) => ({
        ...prev,
        status: "thinking",
        isThinking: true,
        thinking: prev.thinking + ((data.content as string) ?? ""),
      }));
    } else if (event === "thinking_stop") {
      setState((prev) => ({ ...prev, isThinking: false }));
    } else if (event === "content") {
      setState((prev) => ({
        ...prev,
        content: prev.content + ((data.content as string) ?? ""),
      }));
    } else if (event === "done") {
      setState((prev) => ({ ...prev, status: "done", statusMessage: "분석 완료" }));
    } else if (event === "error") {
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: (data.message as string) ?? "알 수 없는 오류",
      }));
    }
  }, []);

  const search = useCallback((query: string) => {
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setState({ ...INITIAL_MCP_STATE, status: "searching", statusMessage: "WebSocket 연결 중..." });

    const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${wsProtocol}//${location.host}/api/ws/search`);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((prev) => ({ ...prev, statusMessage: "MCP 도구 선택 중..." }));
      ws.send(JSON.stringify({ query }));
    };

    ws.onmessage = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data as string) as { event: string; data: Record<string, unknown> };
        handleEvent(msg.event, msg.data);
      } catch {
        // skip malformed
      }
    };

    ws.onerror = () => {
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: "WebSocket 연결 오류가 발생했습니다. 다시 시도해주세요.",
      }));
    };

    ws.onclose = (e) => {
      if (e.code !== 1000 && e.code !== 1001) {
        setState((prev) => {
          if (prev.status === "searching" || prev.status === "thinking") {
            return { ...prev, status: "error", errorMessage: "연결이 끊어졌습니다. 다시 시도해주세요." };
          }
          return prev;
        });
      }
    };
  }, [handleEvent]);

  const reset = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(INITIAL_MCP_STATE);
  }, []);

  useEffect(() => () => {
    wsRef.current?.close();
  }, []);

  return { state, search, reset };
}

function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (/^### /.test(line)) return <h3 key={i} className="font-bold text-base mt-3 mb-1">{line.slice(4)}</h3>;
        if (/^## /.test(line)) return <h2 key={i} className="font-bold text-lg mt-4 mb-1">{line.slice(3)}</h2>;
        if (/^# /.test(line)) return <h1 key={i} className="font-bold text-xl mt-4 mb-2">{line.slice(2)}</h1>;
        if (/^\d+\. \*\*/.test(line)) {
          const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>");
          return <p key={i} className="ml-2 mt-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
        }
        if (/^[-*] /.test(line)) {
          const content = line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          return <li key={i} className="ml-4 list-disc text-foreground/90" dangerouslySetInnerHTML={{ __html: content }} />;
        }
        if (/^\*\*/.test(line)) {
          const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code class='bg-muted px-1 rounded text-xs'>$1</code>");
          return <p key={i} className="mt-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code class='bg-muted px-1 rounded text-xs'>$1</code>");
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40" />;
  return ok
    ? <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
    : <span className="inline-block h-2 w-2 rounded-full bg-red-400" />;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [showThinking, setShowThinking] = useState(true);
  const [collapsedToolCalls, setCollapsedToolCalls] = useState<number[]>([]);
  const { state: mcp, search, reset } = useMcpSearch();
  const { data: stats, isLoading: statsLoading } = usePortalStats();
  const contentRef = useRef<HTMLDivElement>(null);
  const isActive = mcp.status !== "idle";

  const [mcpTools, setMcpTools] = useState<McpToolMeta[]>([]);
  const [mcpHealth, setMcpHealth] = useState<McpHealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    fetch("/api/mcp/tools")
      .then((r) => r.json())
      .then((d: { tools: McpToolMeta[] }) => setMcpTools(d.tools ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mcp.content && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [mcp.content.length > 0]);

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const r = await fetch("/api/mcp/health");
      const d = await r.json() as McpHealthData;
      setMcpHealth(d);
    } catch {
      setMcpHealth({ status: "error", datagouv: "unreachable", mcp: "unreachable", minimax: "unknown", model: "MiniMax-M1", mcpEndpoint: "https://mcp.data.gouv.fr/mcp" });
    } finally {
      setHealthLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setCollapsedToolCalls([]);
    setShowThinking(true);
    search(q);
  };

  const handleExample = (label: string) => {
    setQuery(label);
    setCollapsedToolCalls([]);
    setShowThinking(true);
    search(label);
  };

  const toggleToolCall = (i: number) => {
    setCollapsedToolCalls((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b pt-14 pb-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-1">
            <Cpu className="h-3.5 w-3.5" />
            자연어로 프랑스 공공데이터 포털을 검색하는 MCP
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            프랑스 공공데이터 생태계 탐색
          </h1>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-6 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="자연어로 질문하거나 키워드를 입력하세요..."
                className="pl-12 pr-28 h-14 text-base rounded-full shadow-sm"
              />
              <Button
                type="submit"
                className="absolute right-2 h-10 rounded-full px-5"
                disabled={mcp.status === "searching" || mcp.status === "thinking"}
              >
                {(mcp.status === "searching" || mcp.status === "thinking") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "AI 분석"}
              </Button>
            </div>
          </form>

          {/* Example questions */}
          <div className="max-w-2xl mx-auto space-y-2 mt-2">
            <p className="text-xs text-muted-foreground mb-2">예시 질문 (클릭하면 바로 실행)</p>
            {MCP_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex.label)}
                disabled={mcp.status === "searching" || mcp.status === "thinking"}
                className="w-full text-left px-4 py-2.5 rounded-lg border bg-background hover:bg-muted/60 hover:border-primary/40 transition-all text-sm text-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-2 group"
              >
                <span className="text-primary mt-0.5 shrink-0 text-xs font-mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="group-hover:text-foreground transition-colors">{ex.label}</span>
              </button>
            ))}
            {isActive && (
              <div className="flex justify-end pt-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={reset}>
                  초기화
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 bg-muted/30 border-b px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {statsLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {[
                { icon: Database, label: "데이터셋", value: stats.metrics?.datasets, href: "https://www.data.gouv.fr/fr/datasets/" },
                { icon: Building2, label: "조직", value: stats.metrics?.organizations, href: "https://www.data.gouv.fr/fr/organizations/" },
                { icon: Layers, label: "API 서비스", value: stats.metrics?.dataservices, href: "https://www.data.gouv.fr/fr/dataservices/" },
                { icon: Repeat, label: "활용 사례", value: stats.metrics?.reuses, href: "https://www.data.gouv.fr/fr/reuses/" },
              ].map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-background shadow-sm border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-center gap-1.5 text-primary mb-1 group-hover:text-primary/80">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-xs">{label}</span>
                  </div>
                  <div className="text-xl font-bold">{value?.toLocaleString() ?? "—"}</div>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* MCP Results / Tools Panel */}
      <section className="py-10 px-4 sm:px-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-5">

          {!isActive && (
            <div className="space-y-6">
              {/* MCP Connection Status */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">MCP 연결 정보</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={checkHealth}
                      disabled={healthLoading}
                    >
                      {healthLoading
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <RefreshCw className="h-3 w-3" />}
                      연결 상태 확인
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        label: "MCP Endpoint",
                        value: "https://mcp.data.gouv.fr/mcp",
                        icon: Activity,
                        status: mcpHealth ? mcpHealth.mcp === "ok" : null,
                        statusLabel: mcpHealth ? (mcpHealth.mcp === "ok" ? "연결됨" : "연결 안됨") : "미확인",
                        mono: true,
                      },
                      {
                        label: "연결 모델",
                        value: mcpHealth?.model ?? "GPT-4.1 Mini",
                        icon: Cpu,
                        status: mcpHealth ? mcpHealth.minimax === "configured" : null,
                        statusLabel: mcpHealth ? (mcpHealth.minimax === "configured" ? "API 설정됨" : "미설정") : "미확인",
                        mono: false,
                      },
                      {
                        label: "data.gouv.fr API",
                        value: "api.data.gouv.fr/v1",
                        icon: Zap,
                        status: mcpHealth ? mcpHealth.datagouv === "ok" : null,
                        statusLabel: mcpHealth ? (mcpHealth.datagouv === "ok" ? "정상" : "응답 없음") : "미확인",
                        mono: true,
                      },
                    ].map(({ label, value, icon: Icon, status, statusLabel, mono }) => (
                      <div key={label} className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <StatusDot ok={status} />
                            <span className={status === null ? "text-muted-foreground" : status ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                        <p className={`text-xs font-medium truncate ${mono ? "font-mono text-foreground/70" : "text-foreground"}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* MCP Tools */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">사용 가능한 MCP 도구</h2>
                  <Badge variant="secondary" className="text-xs">{mcpTools.length}개</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {mcpTools.map((tool) => (
                    <div key={tool.name} className="rounded-lg border bg-card p-3.5 space-y-2 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold leading-snug">{tool.label}</p>
                        <span className="text-xs font-mono text-primary/70 shrink-0">{tool.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {tool.params.map((p) => (
                          <span key={p} className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {mcpTools.length === 0 && (
                    <div className="col-span-3 text-center py-6 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      도구 목록 불러오는 중...
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center py-6 text-muted-foreground space-y-2 border-t">
                <Brain className="h-10 w-10 mx-auto opacity-15" />
                <p className="text-sm">위 예시 질문을 클릭하거나 직접 입력해 MCP AI 분석을 시작하세요</p>
              </div>
            </div>
          )}

          {isActive && (
            <>
              {/* Status Bar */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                {(mcp.status === "searching" || mcp.status === "thinking") ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : mcp.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : mcp.status === "error" ? (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                ) : (
                  <Cpu className="h-4 w-4 text-primary shrink-0" />
                )}
                <span className="text-sm font-medium flex-1 min-w-0 truncate">{mcp.statusMessage}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {mcp.toolCalls.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      MCP {mcp.toolCalls.length}회
                    </Badge>
                  )}
                  {(mcp.tokenUsage.input > 0 || mcp.tokenUsage.output > 0) && (
                    <Badge variant="secondary" className="text-xs font-mono gap-1">
                      <span className="text-muted-foreground">in</span>
                      {mcp.tokenUsage.input.toLocaleString()}
                      <span className="text-muted-foreground mx-0.5">·</span>
                      <span className="text-muted-foreground">out</span>
                      {mcp.tokenUsage.output.toLocaleString()}
                      <span className="text-muted-foreground ml-0.5">tok</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Error */}
              {mcp.status === "error" && mcp.errorMessage && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="pt-5 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{mcp.errorMessage}</p>
                  </CardContent>
                </Card>
              )}

              {/* MCP Tool Calls */}
              {mcp.toolCalls.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-orange-500" />
                      <CardTitle className="text-base">MCP 도구 호출 내역</CardTitle>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {mcp.toolCalls.length}개 호출
                      </Badge>
                    </div>
                    <CardDescription>Minimax AI가 선택하고 실행한 MCP 도구 시퀀스</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {mcp.toolCalls.map((tc, i) => (
                      <div key={i} className="rounded-md border bg-muted/30 overflow-hidden">
                        <button
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                          onClick={() => toggleToolCall(i)}
                        >
                          <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">{i + 1}</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs font-mono font-semibold text-orange-600 dark:text-orange-400">{tc.name}</span>
                            {Object.entries(tc.args).slice(0, 2).map(([k, v]) => (
                              <span key={k} className="text-xs text-muted-foreground truncate">
                                {k}=<span className="text-foreground/70">{JSON.stringify(v)}</span>
                              </span>
                            ))}
                          </div>
                          {tc.result
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            : <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
                          }
                          {!collapsedToolCalls.includes(i)
                            ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          }
                        </button>
                        {!collapsedToolCalls.includes(i) && tc.result && (
                          <div className="border-t px-3 py-2 bg-muted/20">
                            <pre className="text-xs text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                              {typeof tc.result === "string"
                                ? tc.result
                                : JSON.stringify(tc.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Thinking Panel — MiniMax M2.7 reasoning */}
              {(mcp.thinking || mcp.isThinking) && (
                <Card className="border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20">
                  <CardHeader
                    className="pb-2 cursor-pointer select-none"
                    onClick={() => setShowThinking((v) => !v)}
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-violet-500" />
                      <CardTitle className="text-base text-violet-700 dark:text-violet-300">MiniMax M2.7 추론 과정</CardTitle>
                      {mcp.isThinking && <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400 ml-1" />}
                      {!mcp.isThinking && mcp.thinking && (
                        <span className="text-[10px] text-violet-400 ml-1">완료</span>
                      )}
                      <button className="ml-auto text-violet-400">
                        {showThinking ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    {!showThinking && mcp.thinking && (
                      <CardDescription className="text-violet-600/70 dark:text-violet-400/70 text-xs line-clamp-1">
                        {mcp.thinking}
                      </CardDescription>
                    )}
                    {!showThinking && !mcp.thinking && mcp.isThinking && (
                      <CardDescription className="text-violet-600/70 dark:text-violet-400/70 text-xs">
                        추론 중...
                      </CardDescription>
                    )}
                  </CardHeader>
                  {showThinking && (
                    <CardContent className="pt-0">
                      <div className="max-h-48 overflow-y-auto">
                        <p className="text-xs text-violet-700/80 dark:text-violet-300/80 whitespace-pre-wrap font-mono leading-relaxed">
                          {mcp.thinking || "추론 중..."}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* AI Analysis */}
              {(mcp.content || mcp.status === "thinking" || mcp.status === "writing") && (
                <div ref={contentRef}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">AI 정책 분석</CardTitle>
                        {mcp.status !== "done" && mcp.content && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-1" />
                        )}
                        {mcp.status === "done" && (
                          <Badge variant="secondary" className="ml-auto text-xs">분석 완료</Badge>
                        )}
                      </div>
                      <CardDescription>
                        MiniMax M2.7 추론 · 도구 호출 {mcp.toolCalls.length}회
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {mcp.content ? (
                        <SimpleMarkdown text={mcp.content} />
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          분석 생성 중...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* Dataset Cards */}
                  {mcp.datasets.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Database className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold">활용된 데이터셋</h3>
                        <Badge variant="secondary" className="text-xs">{mcp.datasets.length}개</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mcp.datasets.map((ds, idx) => (
                          <a
                            key={ds.id}
                            href={ds.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-start gap-3 p-3 rounded-lg border bg-card hover:border-primary/40 hover:shadow-sm transition-all group ${idx === 0 ? "border-primary/30 bg-primary/5" : ""}`}
                          >
                            <div className="shrink-0 flex flex-col items-center gap-1">
                              <span className={`text-[10px] font-bold tabular-nums w-5 h-5 flex items-center justify-center rounded-full ${idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                {idx + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{ds.title}</p>
                                {idx === 0 && (
                                  <span className="shrink-0 text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">추천</span>
                                )}
                              </div>
                              {ds.organization && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{ds.organization}</p>
                              )}
                            </div>
                            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {mcp.status === "done" && (
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        새 검색
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
