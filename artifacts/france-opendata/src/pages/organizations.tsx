import { useState } from "react";
import { Link } from "wouter";
import { Search, Building2, Loader2, HardDrive, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useSearchOrganizations } from "@/hooks/use-datagouv";

export default function Organizations() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const { data: searchResults, isLoading, isError } = useSearchOrganizations(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query.trim());
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">조직 및 기관</h1>
        <p className="text-muted-foreground">
          프랑스 공공데이터 포털에 데이터를 제공하는 정부 기관, 지자체, 공공기관 및 민간 기업을 탐색하세요.
        </p>
      </div>

      <div className="mb-8 max-w-2xl">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="조직 검색 (예: ministere, paris, etalab...)"
            className="pl-12 h-12 text-md shadow-sm"
          />
          <Button type="submit" className="absolute right-1 h-10 px-6">
            검색
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-destructive">
          <p>조직 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      ) : searchResults?.data?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults?.data?.map((org: any) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="w-16 h-16 shrink-0 rounded border bg-white flex items-center justify-center overflow-hidden">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight line-clamp-2" title={org.name}>
                    {org.name}
                  </CardTitle>
                  {org.acronym && (
                    <CardDescription className="mt-1 font-medium text-primary">
                      {org.acronym}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {org.description || "설명이 제공되지 않았습니다."}
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center bg-muted/10 border-t p-4 mt-auto">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5" title="데이터셋 수">
                    <HardDrive className="h-4 w-4" />
                    <span className="font-medium">{org.metrics?.datasets || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="팔로워 수">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{org.metrics?.followers || 0}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/organizations/${org.id}`}>
                    자세히 보기
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
