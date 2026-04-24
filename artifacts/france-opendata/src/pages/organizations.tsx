import { useState, useEffect } from "react";
import {
  ExternalLink,
  Building2,
  HardDrive,
  Users,
  Loader2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { Link } from "wouter";
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
import { Input } from "@/components/ui/input";
import { useSearchOrganizations } from "@/hooks/use-datagouv";
import type { DGOrganization } from "@/types/datagouv";

const FEATURED_ORGS = [
  {
    slug: "etalab",
    name: "Etalab",
    role: "data.gouv.fr 운영 기관",
    description:
      "프랑스 정부 디지털 서비스국(DINUM) 산하 조직으로 data.gouv.fr를 직접 운영·관리합니다. 프랑스 공공데이터 정책의 핵심 허브이며, 오픈데이터 표준·라이선스·API를 총괄합니다.",
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    badge: "플랫폼 운영",
    badgeVariant: "default" as const,
  },
  {
    slug: "insee",
    name: "INSEE",
    role: "국가통계경제연구소",
    description:
      "프랑스 국가통계청으로 인구·경제·사회 통계의 공식 출처입니다. 한국의 통계청(KOSTAT)에 해당하며, 분기 GDP·물가지수·인구 센서스 등 방대한 통계를 공개합니다.",
    color: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
    badge: "국가통계",
    badgeVariant: "secondary" as const,
  },
  {
    slug: "ministere-de-linterieur",
    name: "내무부",
    role: "Ministère de l'Intérieur",
    description:
      "선거 결과, 범죄통계, 자연재해 데이터 등을 공개합니다. 특히 선거 데이터는 세계적으로 투명성이 높아 많은 연구에 활용됩니다.",
    color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    badge: "행정·치안",
    badgeVariant: "destructive" as const,
  },
  {
    slug: "ville-de-paris",
    name: "파리시",
    role: "Ville de Paris",
    description:
      "프랑스 수도 파리의 행정 기관으로 교통·환경·문화·도시계획 데이터를 적극 공개합니다. 스마트시티 오픈데이터 정책의 대표 사례로 전 세계에서 벤치마크합니다.",
    color: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
    badge: "지자체",
    badgeVariant: "outline" as const,
  },
  {
    slug: "sncf",
    name: "SNCF",
    role: "프랑스 국영철도",
    description:
      "프랑스 국영철도 공사로 실시간 열차 운행 데이터, 역사 정보, 지연 통계 등을 API 형태로 제공합니다. 교통 데이터 공개의 모범 사례로 꼽힙니다.",
    color: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
    badge: "교통",
    badgeVariant: "secondary" as const,
  },
  {
    slug: "agence-de-la-transition-ecologique-ademe",
    name: "ADEME",
    role: "생태전환청",
    description:
      "에너지 효율·재생에너지·탄소발자국 관련 데이터를 공개합니다. 프랑스 기후·환경 정책의 핵심 데이터 기관이며, 탄소중립 정책 입안에 필수적인 통계를 제공합니다.",
    color: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    badge: "환경·에너지",
    badgeVariant: "secondary" as const,
  },
];

function FeaturedOrgCard({ org }: { org: (typeof FEATURED_ORGS)[0] }) {
  return (
    <Card className={`border ${org.color} flex flex-col`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{org.name}</CardTitle>
            <CardDescription className="mt-0.5">{org.role}</CardDescription>
          </div>
          <Badge variant={org.badgeVariant} className="shrink-0 mt-0.5">
            {org.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{org.description}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" asChild className="w-full">
          <a
            href={`https://www.data.gouv.fr/fr/organizations/${org.slug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5"
          >
            data.gouv.fr에서 보기 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ActiveOrgCard({ org }: { org: DGOrganization }) {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        <div className="w-12 h-12 shrink-0 rounded border bg-white flex items-center justify-center overflow-hidden">
          {org.logo ? (
            <img src={org.logo} alt={org.name} className="w-full h-full object-contain p-1" />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base leading-snug line-clamp-2">{org.name}</CardTitle>
          {org.acronym && (
            <CardDescription className="font-medium text-primary text-xs mt-0.5">
              {org.acronym}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {org.description || "설명이 제공되지 않았습니다."}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center border-t p-3 mt-auto bg-muted/10">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" title="데이터셋 수">
            <HardDrive className="h-3.5 w-3.5" />
            {org.metrics?.datasets ?? 0}
          </span>
          <span className="flex items-center gap-1" title="팔로워 수">
            <Users className="h-3.5 w-3.5" />
            {org.metrics?.followers ?? 0}
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
          <Link href={`/organizations/${org.id}`} className="flex items-center gap-1">
            보기 <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function FullOrgList() {
  const [expanded, setExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allOrgs, setAllOrgs] = useState<DGOrganization[]>([]);

  const { data, isLoading, isFetching } = useSearchOrganizations(activeSearch, page);

  useEffect(() => {
    if (!expanded) return;
    if (data?.data) {
      if (page === 1) {
        setAllOrgs(data.data);
      } else {
        setAllOrgs((prev) => {
          const ids = new Set(prev.map((o) => o.id));
          return [...prev, ...data.data.filter((o: DGOrganization) => !ids.has(o.id))];
        });
      }
    }
  }, [data, page, expanded]);

  const handleToggle = () => {
    if (!expanded) {
      setPage(1);
      setAllOrgs([]);
      setActiveSearch("");
      setSearchInput("");
    }
    setExpanded((v) => !v);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAllOrgs([]);
    setActiveSearch(searchInput.trim());
  };

  const loadMore = () => setPage((p) => p + 1);

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <div>
          <span className="font-semibold text-base">전체 기관 목록</span>
          <span className="ml-2 text-sm text-muted-foreground">
            data.gouv.fr API 실시간 연동 · 6,000+ 기관
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-5 border-t">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-5 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="기관명 검색 (예: ministere, paris, etalab...)"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              검색
            </Button>
          </form>

          {/* Total count */}
          {data?.total != null && (
            <p className="text-xs text-muted-foreground mb-4">
              총{" "}
              <strong className="text-foreground">{data.total.toLocaleString()}개</strong> 기관 ·
              현재 {allOrgs.length}개 표시
            </p>
          )}

          {/* First load spinner */}
          {isLoading && page === 1 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {allOrgs.map((org) => (
                  <ActiveOrgCard key={org.id} org={org} />
                ))}
              </div>

              {data?.next_page && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isFetching}
                    className="min-w-[180px]"
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        불러오는 중...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        더 보기 ({allOrgs.length} / {data?.total ?? "?"})
                      </>
                    )}
                  </Button>
                </div>
              )}

              {!data?.next_page && allOrgs.length > 0 && (
                <p className="mt-5 text-center text-xs text-muted-foreground">
                  전체 {allOrgs.length}개 기관을 모두 불러왔습니다.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Organizations() {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">조직 및 기관</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          data.gouv.fr에는 현재{" "}
          <strong className="text-foreground">6,000여 개</strong>의 기관이 데이터를 공개하고
          있습니다. 중앙부처·지자체·공기업·학술기관 등 다양한 주체가 참여하는 프랑스의
          '오픈 바이 디폴트' 생태계를 소개합니다.
        </p>
      </div>

      {/* Ecosystem Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: "중앙부처", count: "20+", desc: "경제·내무·보건 등" },
          { label: "지자체·광역", count: "500+", desc: "파리·리옹·마르세유 등" },
          { label: "공기업·산하기관", count: "300+", desc: "SNCF·EDF·IGN 등" },
          { label: "민간·연구기관", count: "5,000+", desc: "대학·NGO·기업 등" },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-lg border bg-muted/30 text-center space-y-1"
          >
            <div className="text-2xl font-bold text-primary">{item.count}</div>
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-xs text-muted-foreground">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Featured Organizations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-1">핵심 기관 소개</h2>
        <p className="text-sm text-muted-foreground mb-5">
          데이터 공개 정책·규모·영향력 측면에서 주목할 만한 기관들입니다.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_ORGS.map((org) => (
            <FeaturedOrgCard key={org.slug} org={org} />
          ))}
        </div>
      </section>

      {/* Full list expand/collapse */}
      <FullOrgList />
    </div>
  );
}
