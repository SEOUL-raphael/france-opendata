import { useParams } from "wouter";
import { useGetDataset } from "@/hooks/use-datagouv";
import type { DGResource } from "@/types/datagouv";
import { Loader2, Building2, Calendar, FileText, Download, Shield, Eye, Repeat, Users, FileJson, FileIcon, FileSpreadsheet, Bot, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useChatContext } from "@/contexts/chat-context";

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

export default function DatasetDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id || "";
  const { openChat } = useChatContext();

  const { data: dataset, isLoading, isError } = useGetDataset(id);

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

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" /> AI 분석
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                이 데이터셋의 구조, 활용 가능성, 한국 정책과의 비교 분석을 AI에게 물어보세요.
              </p>
              <Button className="w-full" onClick={() => openChat(
                `이 데이터셋을 분석해주세요: "${dataset.title}". 주요 내용, 활용 가능성, 한국 정책에서의 시사점을 한국어로 설명해주세요.`
              )}>
                AI로 분석하기
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
