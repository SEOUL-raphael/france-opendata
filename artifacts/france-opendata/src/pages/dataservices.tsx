import { useState, useEffect } from "react";
import { useGetDataservices } from "@/hooks/use-datagouv";
import type { DGDataservice } from "@/types/datagouv";
import {
  Server,
  Code,
  ArrowRight,
  Loader2,
  Shield,
  Calendar,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dataservices() {
  const [page, setPage] = useState(1);
  const [allServices, setAllServices] = useState<DGDataservice[]>([]);
  const [hasNext, setHasNext] = useState(false);

  const { data, isLoading, isError, isFetching } = useGetDataservices(page);

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllServices(data.data);
      } else {
        setAllServices((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const newItems = data.data.filter((s: DGDataservice) => !existingIds.has(s.id));
          return [...prev, ...newItems];
        });
      }
      setHasNext(!!data.next_page);
    }
  }, [data, page]);

  const loadMore = () => setPage((p) => p + 1);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API 서비스 (Dataservices)</h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          프랑스 정부가 공개한 API 서비스 목록입니다. REST API 및 웹 서비스를 통해 실시간
          공공데이터에 접근할 수 있습니다. 프랑스는 'API 우선(API-first)' 접근법으로 데이터
          활용성을 극대화하고 있습니다.
        </p>
        {data?.total != null && (
          <p className="mt-2 text-sm text-muted-foreground">
            총{" "}
            <strong className="text-foreground">{data.total.toLocaleString()}개</strong> API 서비스 ·
            현재 {allServices.length}개 표시
          </p>
        )}
      </div>

      {/* First load */}
      {isLoading && page === 1 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-destructive">
          <p>API 서비스 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      ) : allServices.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <Server className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>등록된 API 서비스가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {allServices.map((service: DGDataservice) => (
              <Card
                key={service.id}
                className="flex flex-col hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-3 border-b bg-muted/10">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-1 flex items-center gap-2">
                        <Server className="h-4 w-4 text-primary shrink-0" />
                        <span className="line-clamp-1">{service.title}</span>
                      </CardTitle>
                      <CardDescription className="line-clamp-1 text-xs">
                        {service.organization?.name ?? "기관 미상"}
                      </CardDescription>
                    </div>
                    {service.private === false && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0 text-xs"
                      >
                        공개 API
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 pb-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {service.description ?? "API 설명이 제공되지 않았습니다."}
                  </p>

                  <div className="space-y-2">
                    {service.base_api_url && (
                      <div className="flex items-center gap-2 text-xs font-mono bg-muted/50 px-2 py-1.5 rounded text-muted-foreground overflow-hidden">
                        <Code className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{service.base_api_url}</span>
                      </div>
                    )}

                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {service.license && (
                        <span className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[140px]">{service.license}</span>
                        </span>
                      )}
                      {service.created_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(service.created_at).toLocaleDateString("ko-KR")}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 gap-2">
                  {service.page ? (
                    <Button variant="secondary" className="flex-1" asChild>
                      <a
                        href={service.page}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        공식 문서 <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <Button variant="secondary" className="flex-1" disabled>
                      문서 없음
                    </Button>
                  )}
                  {service.base_api_url && (
                    <Button variant="outline" size="icon" asChild title="API 엔드포인트 열기">
                      <a
                        href={service.base_api_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Load more */}
          {hasNext && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={loadMore}
                disabled={isFetching}
                className="min-w-[200px]"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    불러오는 중...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    더 보기 ({allServices.length} / {data?.total ?? "?"})
                  </>
                )}
              </Button>
            </div>
          )}

          {!hasNext && allServices.length > 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              전체 {allServices.length}개 API 서비스를 모두 불러왔습니다.
            </p>
          )}
        </>
      )}
    </div>
  );
}
