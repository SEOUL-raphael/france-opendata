import { useParams, Link } from "wouter";
import { useGetOrganization, useGetOrganizationDatasets } from "@/hooks/use-datagouv";
import type { DGDataset, DGResource } from "@/types/datagouv";
import { Building2, Globe, MapPin, ExternalLink, Loader2, Database, Users, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function OrganizationDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id || "";

  const { data: org, isLoading: orgLoading, isError: orgError } = useGetOrganization(id);
  const { data: datasets, isLoading: datasetsLoading } = useGetOrganizationDatasets(id);

  if (orgLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orgError || !org) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-destructive gap-4">
        <p>조직 정보를 불러오지 못했습니다.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-muted-foreground">
          <Link href="/organizations" className="flex items-center gap-1.5">
            <ArrowRight className="h-4 w-4 rotate-180" /> 목록으로 돌아가기
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Organization Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded border bg-white flex items-center justify-center overflow-hidden">
                {org.logo ? (
                  <img src={org.logo} alt={org.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                )}
              </div>
              <h1 className="text-xl font-bold mb-1">{org.name}</h1>
              {org.acronym && (
                <p className="text-primary font-medium mb-4">{org.acronym}</p>
              )}
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="secondary">{org.badges?.[0]?.kind || "기관"}</Badge>
              </div>

              <div className="space-y-3 text-sm text-left">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Database className="h-4 w-4" /> 데이터셋</span>
                  <span className="font-medium text-foreground">{org.metrics?.datasets || 0}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 팔로워</span>
                  <span className="font-medium text-foreground">{org.metrics?.followers || 0}</span>
                </div>
                {org.page && (
                  <>
                    <Separator className="my-2" />
                    <a href={org.page} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                      <Globe className="h-4 w-4" /> 공식 웹사이트
                    </a>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Datasets & Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>기관 소개</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {org.description || "설명이 제공되지 않았습니다."}
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" /> 등록된 데이터셋
            </h2>

            {datasetsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !datasets?.data?.length ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground flex flex-col items-center">
                  <Database className="h-8 w-8 mb-2 opacity-20" />
                  <p>이 기관이 등록한 데이터셋이 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {datasets.data.map((dataset: DGDataset) => (
                  <Card key={dataset.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link href={`/datasets/${dataset.id}`} className="text-base font-semibold hover:underline line-clamp-1">
                          {dataset.title}
                        </Link>
                        <p className="text-xs text-muted-foreground flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> 
                            {dataset.last_update ? new Date(dataset.last_update).toLocaleDateString() : "—"}
                          </span>
                          {dataset.frequency && (
                            <span className="capitalize text-muted-foreground/70">• {dataset.frequency}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 shrink-0">
                        {dataset.resources?.slice(0, 3).map((res: DGResource, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0">
                            {res.format || 'FILE'}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
