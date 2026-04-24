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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePortalStats } from "@/hooks/use-datagouv";

const CATEGORIES = [
  { ko: "교육", fr: "education" },
  { ko: "보건", fr: "sante" },
  { ko: "교통", fr: "transport" },
  { ko: "경제", fr: "economie" },
  { ko: "환경", fr: "environnement" },
  { ko: "문화", fr: "culture" },
];

interface McpDataset {
  id: string;
  title: string;
  description: string | null;
  organization: string | null;
  last_update: string | null;
  tags: string[];
  license: string | null;
  resources_count: number;
}

interface McpSearchState {
  status: "idle" | "searching" | "thinking" | "done" | "error";
  statusMessage: string;
  toolResult: { query: string; total: number; datasets: McpDataset[] } | null;
  thinking: string;
  content: string;
  errorMessage: string | null;
}

function useMcpSearch() {
  const [state, setState] = useState<McpSearchState>({
    status: "idle",
    statusMessage: "",
    toolResult: null,
    thinking: "",
    content: "",
    errorMessage: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      status: "searching",
      statusMessage: `data.gouv.fr에서 "${query}" 검색 중...`,
      toolResult: null,
      thinking: "",
      content: "",
      errorMessage: null,
    });

    try {
      const response = await fetch("/api/mcp/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("서버 오류가 발생했습니다.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType = "message";
          let dataLine = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) dataLine = line.slice(6);
          }

          if (!dataLine) continue;

          try {
            const data = JSON.parse(dataLine) as Record<string, unknown>;

            if (eventType === "status") {
              setState((prev) => ({
                ...prev,
                status: (data.step as McpSearchState["status"]) ?? "searching",
                statusMessage: (data.message as string) ?? "",
              }));
            } else if (eventType === "tool_result") {
              setState((prev) => ({
                ...prev,
                toolResult: data as McpSearchState["toolResult"],
              }));
            } else if (eventType === "thinking") {
              setState((prev) => ({
                ...prev,
                thinking: prev.thinking + ((data.content as string) ?? ""),
              }));
            } else if (eventType === "content") {
              setState((prev) => ({
                ...prev,
                content: prev.content + ((data.content as string) ?? ""),
              }));
            } else if (eventType === "done") {
              setState((prev) => ({ ...prev, status: "done" }));
            } else if (eventType === "error") {
              setState((prev) => ({
                ...prev,
                status: "error",
                errorMessage: (data.message as string) ?? "알 수 없는 오류",
              }));
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: "연결 오류가 발생했습니다. 다시 시도해주세요.",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState({
      status: "idle",
      statusMessage: "",
      toolResult: null,
      thinking: "",
      content: "",
      errorMessage: null,
    });
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { state, search, reset };
}

function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (/^### /.test(line)) {
          return (
            <h3 key={i} className="font-bold text-base mt-3 mb-1">
              {line.slice(4)}
            </h3>
          );
        }
        if (/^## /.test(line)) {
          return (
            <h2 key={i} className="font-bold text-lg mt-4 mb-1">
              {line.slice(3)}
            </h2>
          );
        }
        if (/^# /.test(line)) {
          return (
            <h1 key={i} className="font-bold text-xl mt-4 mb-2">
              {line.slice(2)}
            </h1>
          );
        }
        if (/^\d+\. \*\*/.test(line)) {
          const formatted = line
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/`(.+?)`/g, "<code>$1</code>");
          return (
            <p
              key={i}
              className="ml-2 mt-2"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        }
        if (/^[-*] /.test(line)) {
          const content = line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          return (
            <li
              key={i}
              className="ml-4 list-disc"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        const formatted = line
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.+?)`/g, "<code class='bg-muted px-1 rounded text-xs'>$1</code>");
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      })}
    </div>
  );
}

function McpStatusBar({ status, message }: { status: McpSearchState["status"]; message: string }) {
  const isActive = status === "searching" || status === "thinking";
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      {isActive ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
      ) : status === "done" ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : status === "error" ? (
        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
      ) : (
        <Cpu className="h-4 w-4 text-primary shrink-0" />
      )}
      <span className="text-sm font-medium text-foreground">{message}</span>
      <div className="ml-auto flex items-center gap-1.5">
        {(["searching", "thinking", "done"] as const).map((step, idx) => (
          <div
            key={step}
            className={`h-2 w-2 rounded-full transition-colors ${
              status === step
                ? "bg-primary"
                : status === "done" || (idx === 0 && status === "thinking")
                ? "bg-green-400"
                : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const { state: mcp, search, reset } = useMcpSearch();
  const { data: stats, isLoading: statsLoading } = usePortalStats();
  const contentRef = useRef<HTMLDivElement>(null);

  const isActive = mcp.status !== "idle";

  useEffect(() => {
    if (mcp.content && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [mcp.content.length > 0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    search(q);
  };

  const handleCategory = (fr: string) => {
    setQuery(fr);
    search(fr);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b pt-14 pb-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-1">
            <Cpu className="h-3.5 w-3.5" />
            자연어로 Minimax 모델이 MCP를 통해 검색
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
                placeholder="데이터셋 주제 검색 (예: transport, education, budget...)"
                className="pl-12 pr-28 h-14 text-base rounded-full shadow-sm"
              />
              <Button
                type="submit"
                className="absolute right-2 h-10 rounded-full px-5"
                disabled={mcp.status === "searching" || mcp.status === "thinking"}
              >
                {(mcp.status === "searching" || mcp.status === "thinking") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "AI 분석"
                )}
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.ko}
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-background"
                  onClick={() => handleCategory(cat.fr)}
                  type="button"
                  disabled={mcp.status === "searching" || mcp.status === "thinking"}
                >
                  {cat.ko}
                </Button>
              ))}
              {isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-muted-foreground"
                  onClick={reset}
                  type="button"
                >
                  초기화
                </Button>
              )}
            </div>
          </form>
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
                  <div className="text-xl font-bold">
                    {value?.toLocaleString() ?? "—"}
                  </div>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* MCP Results */}
      <section className="py-10 px-4 sm:px-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-5">
          {!isActive && (
            <div className="text-center py-20 text-muted-foreground space-y-3">
              <Brain className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-lg font-medium">MCP 도구로 AI 분석을 시작하세요</p>
              <p className="text-sm max-w-md mx-auto">
                위 검색창에 주제어를 입력하면 data.gouv.fr API를 도구로 호출하여
                프랑스 공공데이터를 수집하고 Minimax AI가 분석합니다.
              </p>
            </div>
          )}

          {isActive && (
            <>
              {/* Status Bar */}
              <McpStatusBar status={mcp.status} message={mcp.statusMessage} />

              {/* Error */}
              {mcp.status === "error" && mcp.errorMessage && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="pt-5 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{mcp.errorMessage}</p>
                  </CardContent>
                </Card>
              )}

              {/* Tool Result */}
              {mcp.toolResult && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-orange-500" />
                      <CardTitle className="text-base">MCP 도구 결과</CardTitle>
                      <Badge variant="outline" className="ml-auto">
                        data.gouv.fr API
                      </Badge>
                    </div>
                    <CardDescription>
                      &ldquo;{mcp.toolResult.query}&rdquo; 검색 →{" "}
                      <strong>{mcp.toolResult.total.toLocaleString()}개</strong> 데이터셋 발견,
                      상위 {mcp.toolResult.datasets.length}개 수집
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {mcp.toolResult.datasets.map((ds, i) => (
                      <div
                        key={ds.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors"
                      >
                        <span className="text-xs font-mono text-muted-foreground mt-0.5 w-5 shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/datasets/${ds.id}`}
                            className="font-medium text-sm hover:underline line-clamp-1"
                          >
                            {ds.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            {ds.organization && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {ds.organization}
                              </span>
                            )}
                            {ds.resources_count > 0 && (
                              <span className="text-xs text-muted-foreground">
                                리소스 {ds.resources_count}개
                              </span>
                            )}
                            {ds.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <Link href={`/datasets/${ds.id}`}>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Thinking Panel */}
              {mcp.thinking && (
                <Card className="border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20">
                  <CardHeader
                    className="pb-2 cursor-pointer select-none"
                    onClick={() => setShowThinking((v) => !v)}
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-violet-500" />
                      <CardTitle className="text-base text-violet-700 dark:text-violet-300">
                        AI 추론 과정
                      </CardTitle>
                      {mcp.status === "thinking" && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400 ml-1" />
                      )}
                      <button className="ml-auto text-violet-400">
                        {showThinking ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {!showThinking && (
                      <CardDescription className="text-violet-600/70 dark:text-violet-400/70 text-xs line-clamp-1">
                        {mcp.thinking}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {showThinking && (
                    <CardContent className="pt-0">
                      <div className="max-h-48 overflow-y-auto">
                        <p className="text-xs text-violet-700/80 dark:text-violet-300/80 whitespace-pre-wrap font-mono leading-relaxed">
                          {mcp.thinking}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* AI Analysis */}
              {(mcp.content || mcp.status === "thinking") && (
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
                        <Badge variant="secondary" className="ml-auto text-xs">
                          분석 완료
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Minimax MiniMax-M1 · 1회 추론 루프 · 한국 정책결정자 관점
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
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
