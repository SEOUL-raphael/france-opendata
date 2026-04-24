import { useGetDataservices } from "@/hooks/use-datagouv";
import type { DGDataservice } from "@/types/datagouv";
import { Server, Code, ArrowRight, Loader2, Shield, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dataservices() {
  const { data: dataservices, isLoading, isError } = useGetDataservices();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API 서비스 (Dataservices)</h1>
        <p className="text-muted-foreground max-w-3xl">
          프랑스 정부가 공개한 API 서비스 목록입니다. 시스템 간 직접 연동이 가능한 REST API 및 웹 서비스를 통해 실시간 공공데이터에 접근할 수 있습니다. 프랑스는 'API 우선 (API-first)' 접근법을 통해 데이터 활용성을 극대화하고 있습니다.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-destructive">
          <p>API 서비스 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      ) : dataservices?.data?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <Server className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>등록된 API 서비스가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataservices?.data?.map((service: DGDataservice) => (
            <Card key={service.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1 flex items-center gap-2">
                      <Server className="h-5 w-5 text-primary shrink-0" />
                      <span className="line-clamp-1">{service.title}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {service.organization?.name || "Unknown Organization"}
                    </CardDescription>
                  </div>
                  {service.private === false && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">Public API</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-4 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {service.description || "API 설명이 제공되지 않았습니다."}
                </p>
                
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="flex items-center gap-2 text-xs font-mono bg-muted/50 p-2 rounded text-muted-foreground overflow-hidden">
                    <Code className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{service.base_api_url || "Base URL 미제공"}</span>
                  </div>
                  
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    {service.license && (
                      <div className="flex items-center gap-1.5" title="라이선스">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]">{service.license}</span>
                      </div>
                    )}
                    {service.created_at && (
                      <div className="flex items-center gap-1.5" title="등록일">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(service.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 mt-auto">
                <Button variant="secondary" className="w-full" asChild>
                  <a href={service.page ?? undefined} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    공식 문서 보기 <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
