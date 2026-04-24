import { useState } from "react";
import { useParams } from "wouter";
import { useGetDataset } from "@/hooks/use-datagouv";
import type { DGResource } from "@/types/datagouv";
import { Loader2, Building2, Calendar, FileText, Download, Shield, Eye, Repeat, Users, FileJson, FileIcon, FileSpreadsheet, Bot, HardDrive, Lightbulb, BookOpen, Database, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSendChatMessage } from "@workspace/api-client-react";

const getFormatColor = (format: string | null) => {
  const f = (format ?? "").toLowerCase();
  if (f.includes('csv')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
  if (f.includes('json')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  if (f.includes('xls') || f.includes('xlsx')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
  if (f.includes('pdf')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  if (f.includes('zip') || f.includes('rar')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
};

const getFormatIcon = (format: string | null) => {
  const f = (format ?? "").toLowerCase();
  if (f.includes('csv') || f.includes('xls')) return <FileSpreadsheet className="h-4 w-4" />;
  if (f.includes('json')) return <FileJson className="h-4 w-4" />;
  return <FileIcon className="h-4 w-4" />;
};

const formatBytes = (bytes: number) => {
  if (!bytes) return 'N/A';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface AnalysisResult {
  summary: string;
  policyUse: string;
  koreaDataset: string;
}

function isValidAnalysisResult(obj: unknown): obj is AnalysisResult {
  if (!obj || typeof obj !== "object") return false;
  const r = obj as Record<string, unknown>;
  return typeof r.summary === "string" && r.summary.length > 0
    && typeof r.policyUse === "string"
    && typeof r.koreaDataset === "string";
}

function tryParseJson(text: string): AnalysisResult | null {
  try {
    const parsed = JSON.parse(text);
    if (isValidAnalysisResult(parsed)) return parsed;
  } catch {
  }
  return null;
}

function parseAnalysisResult(content: string): AnalysisResult {
  const fenceMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (fenceMatch?.[1]) {
    const result = tryParseJson(fenceMatch[1].trim());
    if (result) return result;
  }

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const result = tryParseJson(content.slice(firstBrace, lastBrace + 1));
    if (result) return result;
  }

  const summaryMatch = content.match(/##?\s*(?:1\.|①)?\s*한국어\s*요약[^\n]*\n([\s\S]*?)(?=##?\s*(?:2\.|②)|$)/i);
  const policyMatch = content.match(/##?\s*(?:2\.|②)?\s*(?:한국\s*)?정책[^\n]*활용[^\n]*\n([\s\S]*?)(?=##?\s*(?:3\.|③)|$)/i);
  const koreaMatch = content.match(/##?\s*(?:3\.|③)?\s*data\.go\.kr[^\n]*\n([\s\S]*?)(?=##?\s*(?:4\.)|$)/i);

  if (summaryMatch || policyMatch || koreaMatch) {
    return {
      summary: summaryMatch?.[1]?.trim() ?? content,
      policyUse: policyMatch?.[1]?.trim() ?? "",
      koreaDataset: koreaMatch?.[1]?.trim() ?? "",
    };
  }

  return {
    summary: content,
    policyUse: "",
    koreaDataset: "",
  };
}

function AnalysisCards({ result }: { result: AnalysisResult }) {
  return (
    <div className="mt-6 space-y-4">
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <BookOpen className="h-4 w-4" />
            한국어 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.summary}</p>
        </CardContent>
      </Card>

      {result.policyUse && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Lightbulb className="h-4 w-4" />
              한국 정책 활용 방안
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.policyUse}</p>
          </CardContent>
        </Card>
      )}

      {result.koreaDataset && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Database className="h-4 w-4" />
              data.go.kr 대응 데이터셋
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.koreaDataset}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DatasetDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id || "";

  const { data: dataset, isLoading, isError } = useGetDataset(id);
  const analysisMutation = useSendChatMessage();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!dataset || analysisMutation.isPending) return;
    setAnalysisResult(null);
    setAnalysisError(null);

    const resourceFormats = dataset.resources?.map((r: DGResource) => r.format).filter(Boolean).join(", ") || "정보 없음";
    const resourceCount = dataset.resources?.length ?? 0;

    const prompt = `다음 프랑스 공공데이터셋을 분석하여 정확히 아래 JSON 형식으로만 응답해주세요. 마크다운 코드 블록 없이 순수 JSON만 반환하세요.

데이터셋 정보:
- 제목: ${dataset.title}
- 설명: ${dataset.description?.slice(0, 500) || "없음"}
- 제공 기관: ${dataset.organization?.name || "미상"}
- 라이선스: ${dataset.license || "미지정"}
- 업데이트 주기: ${dataset.frequency || "미정"}
- 리소스 수: ${resourceCount}개 (형식: ${resourceFormats})
- 태그: ${dataset.tags?.slice(0, 10).join(", ") || "없음"}

요청 형식:
{
  "summary": "데이터셋의 핵심 내용, 수록 데이터 범위, 특징을 3~5문장으로 한국어로 요약",
  "policyUse": "한국 정부 및 지자체에서 이 데이터를 어떻게 활용할 수 있는지 구체적인 정책 사례와 함께 3~5문장으로 설명",
  "koreaDataset": "data.go.kr에서 이와 유사하거나 대응되는 데이터셋의 이름, 특징, 프랑스 데이터셋과의 차이점을 3~5문장으로 설명"
}`;

    analysisMutation.mutate(
      {
        data: {
          messages: [{ role: "user", content: prompt }],
          context: `Dataset analysis request for: ${dataset.title} (id: ${id})`,
        },
      },
      {
        onSuccess: (response) => {
          const parsed = parseAnalysisResult(response.content);
          setAnalysisResult(parsed);
        },
        onError: () => {
          setAnalysisError("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !dataset) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-destructive gap-4">
        <p>데이터셋을 불러오지 못했습니다.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">{dataset.title}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {dataset.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border border-border/50 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {dataset.description || "설명이 제공되지 않았습니다."}
            </div>
          </div>

          {/* AI Analysis Section - inline in main content */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> AI 분석
            </h2>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  클릭 한 번으로 이 데이터셋의 한국어 요약, 한국 정책 활용 방안, data.go.kr 대응 데이터셋을 확인하세요.
                </p>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleAnalyze}
                  disabled={analysisMutation.isPending}
                >
                  {analysisMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI로 분석하기
                    </>
                  )}
                </Button>

                {analysisMutation.isPending && (
                  <div className="mt-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-lg border p-4 animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded w-full" />
                          <div className="h-3 bg-muted rounded w-5/6" />
                          <div className="h-3 bg-muted rounded w-4/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {analysisError && (
                  <div className="mt-4 flex items-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {analysisError}
                  </div>
                )}

                {analysisResult && !analysisMutation.isPending && (
                  <AnalysisCards result={analysisResult} />
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" /> 데이터 리소스 ({dataset.resources?.length || 0})
            </h2>
            <div className="space-y-3">
              {dataset.resources?.map((resource: DGResource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${getFormatColor(resource.format)}`}>
                        {getFormatIcon(resource.format)}
                        {resource.format || 'FILE'}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm line-clamp-1" title={resource.title || resource.url.split('/').pop()}>
                          {resource.title || resource.url.split('/').pop()}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                          <span>마지막 수정: {new Date(resource.last_modified ?? resource.created_at).toLocaleDateString()}</span>
                          {resource.filesize && <span>• {formatBytes(resource.filesize)}</span>}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="default" className="shrink-0 sm:self-center">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Download className="h-4 w-4" /> 다운로드
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
              {dataset.resources?.length === 0 && (
                <p className="text-muted-foreground text-sm py-4">사용 가능한 리소스가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Right 1 Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-base font-semibold">제공 기관</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                {dataset.organization?.logo ? (
                  <img src={dataset.organization.logo} alt={dataset.organization.name} className="w-12 h-12 rounded object-contain bg-white" />
                ) : (
                  <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm">{dataset.organization?.name || "개인/미상"}</div>
                  {dataset.organization?.acronym && (
                    <div className="text-xs text-muted-foreground">{dataset.organization.acronym}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-base font-semibold">메타데이터</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> 업데이트</div>
                  <div className="font-medium">{dataset.last_update ? new Date(dataset.last_update).toLocaleDateString() : "정보 없음"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5" /> 주기</div>
                  <div className="font-medium capitalize">{dataset.frequency || "미정"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground mb-1 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 라이선스</div>
                  <div className="font-medium">{dataset.license || "미지정"}</div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5" title="조회수"><Eye className="h-4 w-4" /> {dataset.metrics?.views || 0}</div>
                <div className="flex items-center gap-1.5" title="팔로워"><Users className="h-4 w-4" /> {dataset.metrics?.followers || 0}</div>
                <div className="flex items-center gap-1.5" title="활용 사례"><FileText className="h-4 w-4" /> {dataset.metrics?.reuses || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
