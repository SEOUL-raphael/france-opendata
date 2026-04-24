import { useState } from "react";
import { Link } from "wouter";
import { Search, Database, Building2, Layers, Repeat, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchDatasets, usePortalStats } from "@/hooks/use-datagouv";
import type { DGDataset } from "@/types/datagouv";

const CATEGORIES = [
  { ko: "교육", fr: "education" },
  { ko: "보건", fr: "sante" },
  { ko: "교통", fr: "transport" },
  { ko: "경제", fr: "economie" },
  { ko: "환경", fr: "environnement" },
  { ko: "문화", fr: "culture" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("france"); // Default search to show something

  const { data: stats, isLoading: statsLoading } = usePortalStats();
  const { data: searchResults, isLoading: searchLoading, isError } = useSearchDatasets(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveQuery(query.trim());
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b pt-16 pb-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            프랑스 공공데이터 생태계 탐색
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            대한민국 정책 입안자를 위한 data.gouv.fr 벤치마킹 레퍼런스 도구.
            프랑스의 '오픈 바이 디폴트' 철학이 담긴 데이터셋을 검색하고 분석하세요.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-8 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="데이터셋 검색 (예: transport, education, budget...)"
                className="pl-12 pr-24 h-14 text-lg rounded-full shadow-sm"
              />
              <Button 
                type="submit" 
                className="absolute right-2 h-10 rounded-full px-6"
                disabled={searchLoading}
              >
                검색
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.ko}
                  variant="outline"
                  className="rounded-full bg-background"
                  onClick={() => {
                    setQuery(cat.fr);
                    setActiveQuery(cat.fr);
                  }}
                  type="button"
                >
                  {cat.ko}
                </Button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-muted/30 border-b px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {statsLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-background shadow-sm border border-border/50">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Database className="h-5 w-5" />
                  <span className="font-semibold text-sm">데이터셋</span>
                </div>
                <div className="text-2xl font-bold">{stats.metrics?.datasets?.toLocaleString() || "19,000+"}</div>
              </div>
              <div className="p-4 rounded-lg bg-background shadow-sm border border-border/50">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold text-sm">조직</span>
                </div>
                <div className="text-2xl font-bold">{stats.metrics?.organizations?.toLocaleString() || "4,500+"}</div>
              </div>
              <div className="p-4 rounded-lg bg-background shadow-sm border border-border/50">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Layers className="h-5 w-5" />
                  <span className="font-semibold text-sm">API 서비스</span>
                </div>
                <div className="text-2xl font-bold">{stats.metrics?.dataservices?.toLocaleString() || "100+"}</div>
              </div>
              <div className="p-4 rounded-lg bg-background shadow-sm border border-border/50">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Repeat className="h-5 w-5" />
                  <span className="font-semibold text-sm">활용 사례</span>
                </div>
                <div className="text-2xl font-bold">{stats.metrics?.reuses?.toLocaleString() || "3,200+"}</div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 px-4 sm:px-8 flex-1 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          검색 결과 <span className="text-muted-foreground font-normal text-lg">"{activeQuery}"</span>
        </h2>

        {searchLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-destructive">
            <p>결과를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        ) : searchResults?.data?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {searchResults?.data?.map((dataset: DGDataset) => (
              <Card key={dataset.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-xl line-clamp-1">
                        <Link href={`/datasets/${dataset.id}`} className="hover:underline">
                          {dataset.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Building2 className="h-3 w-3" />
                        {dataset.organization?.name || "기관 미상"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="shrink-0 bg-primary/5">
                      {dataset.last_update ? new Date(dataset.last_update).toLocaleDateString() : "—"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {dataset.description || "설명이 제공되지 않았습니다."}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {dataset.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {dataset.tags?.length > 3 && (
                      <Badge variant="secondary" className="text-xs">+{dataset.tags.length - 3}</Badge>
                    )}
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0">
                    <Link href={`/datasets/${dataset.id}`} className="flex items-center gap-1">
                      자세히 보기 <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
