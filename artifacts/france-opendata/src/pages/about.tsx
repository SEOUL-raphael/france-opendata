import {
  Building2,
  Globe,
  FileCheck,
  Server,
  ArrowRight,
  Quote,
  ShieldCheck,
  ExternalLink,
  Zap,
  Leaf,
  TrendingUp,
  MapPin,
  GraduationCap,
  HeartPulse,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const USE_CASES = [
  {
    category: "안전·행정",
    icon: Zap,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    items: [
      {
        name: "응급 출동 위치 정확화",
        original: "La prise d'appel des secours",
        description:
          "소방·응급 신고 센터에서 전국 주소 데이터베이스(BAN)를 활용해 출동 위치를 정확히 파악합니다. 주소 오류로 인한 골든타임 손실을 줄이는 데 기여하고 있습니다.",
        dataUsed: "전국 주소 데이터베이스 (BAN)",
        impact: "골든타임 확보",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/prise_d_appel_des_secours/",
      },
      {
        name: "환경 위험·오염 현황 파악",
        original: "ERRIAL",
        description:
          "토지 거래 전 해당 부지의 환경 오염, 자연재해 위험, 산업시설 인접 여부 등을 데이터로 즉시 확인할 수 있는 서비스입니다. 부동산 전문가와 시민 모두 이용 가능합니다.",
        dataUsed: "환경 위험 데이터, 산업시설 데이터",
        impact: "부동산 의사결정 지원",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/errial/",
      },
    ],
  },
  {
    category: "경제·부동산",
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    items: [
      {
        name: "경영 위기 기업 조기 탐지",
        original: "Signaux Faibles",
        description:
          "SIRENE(기업등록) 데이터, 세금 납부 현황, 고용보험 정보 등을 결합해 경영 위기에 처한 기업을 조기에 탐지합니다. 공무원이 선제적으로 지원책을 제안할 수 있게 합니다.",
        dataUsed: "SIRENE, 세금 데이터, 고용보험 데이터",
        impact: "기업 도산 예방",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/signaux-faibles/",
      },
      {
        name: "부동산 실거래가 공개 (DVF)",
        original: "Données de valeur foncière",
        description:
          "프랑스 전역의 부동산 실거래 가격 데이터를 공개합니다. 시민, 부동산 전문가, 연구자 등이 지역별·유형별 실거래가를 자유롭게 분석할 수 있습니다.",
        dataUsed: "토지·건물 실거래 데이터",
        impact: "부동산 시장 투명성 제고",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/dvf/",
      },
      {
        name: "주유소 실시간 유가 공개",
        original: "Prix des carburants",
        description:
          "프랑스 전국 1만여 개 주유소의 실시간 유가를 공개합니다. 소비자 앱, 지도 서비스, 언론 등 수백 개 서비스가 이 데이터를 재활용합니다.",
        dataUsed: "에너지부 주유소 가격 데이터",
        impact: "소비자 후생 개선",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/prix-carburants/",
      },
      {
        name: "기업 정보 통합 검색",
        original: "Annuaire des entreprises",
        description:
          "SIRENE 데이터 기반의 기업 정보 검색 포털입니다. 사업자 등록번호(SIRET/SIREN) 검색으로 기업의 업종, 규모, 법적 형태, 대표자 등을 즉시 확인할 수 있습니다.",
        dataUsed: "SIRENE (기업 등록 데이터베이스)",
        impact: "행정 절차 간소화",
        url: "https://annuaire-entreprises.data.gouv.fr/",
      },
    ],
  },
  {
    category: "환경·도시",
    icon: Leaf,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    items: [
      {
        name: "도시 수목 유산 파악",
        original: "Nos Villes Vertes",
        description:
          "지자체가 공개한 수목 데이터를 활용해 시민이 자신이 사는 지역의 나무 종류, 나이, 위치를 지도로 확인할 수 있습니다. 도시 녹지 정책 수립에 활용됩니다.",
        dataUsed: "지자체 수목 인벤토리 데이터",
        impact: "도시 녹지 정책 지원",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/nos-villes-vertes/",
      },
      {
        name: "꿀벌 서식 자원 추정",
        original: "BeeGIS",
        description:
          "위성 이미지와 토지 이용 현황 데이터를 결합해 특정 지역의 꿀벌 서식 적합성을 평가합니다. 양봉업자와 연구자들이 최적의 양봉 위치를 선정하는 데 활용합니다.",
        dataUsed: "토지 이용 현황 데이터 (Corine Land Cover)",
        impact: "농업 생산성 및 생태계 보전",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/beegis/",
      },
    ],
  },
  {
    category: "교통·인프라",
    icon: MapPin,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800",
    items: [
      {
        name: "전국 교통 데이터 통합 플랫폼",
        original: "Transport.data.gouv.fr",
        description:
          "버스·지하철·기차·자전거 등 모든 교통수단의 GTFS 데이터를 한 곳에 집약합니다. 구글 맵, 애플 맵, SNCF 앱 등 수많은 서비스가 이 플랫폼의 데이터를 활용합니다.",
        dataUsed: "GTFS(교통 시간표), 실시간 운행 데이터",
        impact: "멀티모달 이동 서비스 활성화",
        url: "https://transport.data.gouv.fr/",
      },
      {
        name: "전국 주소 데이터베이스 (BAN)",
        original: "Base Adresse Nationale",
        description:
          "프랑스 전체 건물의 주소를 표준화한 공개 데이터베이스입니다. 응급 서비스, 전자상거래, 행정 서비스 등 수천 개 애플리케이션이 BAN API를 호출합니다.",
        dataUsed: "지자체 주소 데이터, 카다스트르(지적도)",
        impact: "행정·물류·응급 서비스 효율화",
        url: "https://adresse.data.gouv.fr/",
      },
    ],
  },
  {
    category: "사회·교육",
    icon: GraduationCap,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    items: [
      {
        name: "진로 탐색 경로 제안",
        original: "DiagOriente",
        description:
          "직업 훈련 및 취업 지원 기관의 데이터와 노동시장 통계를 결합해 개인에게 맞춤형 진로 경로를 제안합니다. 취업·재취업 지원 상담에서 활발히 활용됩니다.",
        dataUsed: "직업 훈련 기관 데이터, 노동시장 통계",
        impact: "취업 지원 서비스 효율화",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/diagoriente/",
      },
      {
        name: "농업 경영 간소화",
        original: "Ekylibre",
        description:
          "농업 보조금 신청에 필요한 필지 데이터, 작물 분류 데이터 등을 오픈데이터로 연동해 농업인이 행정 서류 작성 시간을 대폭 줄일 수 있게 합니다.",
        dataUsed: "농업 필지 데이터 (RPG), 작물 분류 데이터",
        impact: "농업 행정 부담 감소",
        url: "https://www.data.gouv.fr/fr/pages/onboarding/cas_usage/ekylibre/",
      },
    ],
  },
  {
    category: "보건",
    icon: HeartPulse,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800",
    items: [
      {
        name: "전국 의료기관 접근성 정보",
        original: "Données de santé publique",
        description:
          "전국 의료기관(병원, 약국, 의원)의 위치·전문과목·장애인 접근성 정보를 공개합니다. 시민이 주변 의료기관을 쉽게 찾고, 공공보건 정책 수립에 활용됩니다.",
        dataUsed: "FINESS(의료기관 등록), 접근성 데이터",
        impact: "의료 접근성 개선",
        url: "https://www.data.gouv.fr/fr/organizations/ministere-des-solidarites-et-de-la-sante/",
      },
    ],
  },
];

type CategoryKey = "전체" | "안전·행정" | "경제·부동산" | "환경·도시" | "교통·인프라" | "사회·교육" | "보건";

const ALL_CATEGORIES: CategoryKey[] = [
  "전체",
  "안전·행정",
  "경제·부동산",
  "환경·도시",
  "교통·인프라",
  "사회·교육",
  "보건",
];

function UseCaseCard({
  item,
  categoryColor,
  categoryBg,
  categoryBorder,
}: {
  item: (typeof USE_CASES)[0]["items"][0];
  categoryColor: string;
  categoryBg: string;
  categoryBorder: string;
}) {
  return (
    <Card className={`border ${categoryBorder} ${categoryBg} flex flex-col`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base leading-snug">{item.name}</CardTitle>
            <CardDescription className="text-xs mt-0.5 italic">{item.original}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-1 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2 text-xs">
            <span className="font-medium text-foreground shrink-0">활용 데이터:</span>
            <span className="text-muted-foreground">{item.dataUsed}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-foreground shrink-0">기대 효과:</span>
            <Badge variant="secondary" className={`text-xs ${categoryColor}`}>
              {item.impact}
            </Badge>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-5">
        <Button variant="outline" size="sm" asChild className="w-full">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5"
          >
            data.gouv.fr에서 자세히 보기 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

export default function About() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <div className="text-center mb-10 space-y-3">
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-3 py-1">
          Policy Brief
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">프랑스 공공데이터 포털 벤치마킹</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          대한민국 디지털 플랫폼 정부 구현을 위한 data.gouv.fr 분석 보고서
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">소개</TabsTrigger>
          <TabsTrigger value="usecases">활용 사례</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ─────────────────────────────── */}
        <TabsContent value="overview" className="space-y-14">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">1. 탄생 배경 및 운영 주체</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              프랑스의 공공데이터 포털 <strong>data.gouv.fr</strong>는 2011년 François Fillon
              총리의 통달로 설립되었습니다. 현재는 총리실 직속의 디지털 정부 태스크포스인{" "}
              <strong>Etalab(에탈랍)</strong>이 운영을 전담하고 있습니다. Etalab은 단순한 포털
              운영을 넘어 프랑스 정부의 데이터 전략, AI 활용, 오픈소스 정책을 총괄하는 핵심
              조직입니다.
            </p>
            <Card className="mt-8 border-l-4 border-l-primary bg-primary/5">
              <CardContent className="p-6 relative">
                <Quote className="absolute top-4 left-4 h-12 w-12 text-primary/10 -z-10" />
                <blockquote className="text-lg font-medium text-foreground italic pl-6">
                  "공공데이터는 원칙적으로 공개되어야 하며, 이는 국가의 투명성과 혁신을 위한
                  기반이다."
                </blockquote>
              </CardContent>
            </Card>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">2. 핵심 철학: 오픈 바이 디폴트</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">기본 공개 원칙</h3>
                  <p className="text-muted-foreground text-sm">
                    2016년 디지털 공화국법(Loi pour une République numérique)을 통해 특정 예외를
                    제외한 모든 정부 데이터의 기본 공개를 법제화했습니다.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <FileCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">Etalab 라이선스</h3>
                  <p className="text-muted-foreground text-sm">
                    출처 표기만을 요구하는 유연한 자체 오픈 라이선스(Licence Ouverte)를 개발해
                    데이터의 상업적·비상업적 재사용을 극대화했습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Server className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">3. 주요 기술적 특징</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "API 우선",
                  desc: "데이터를 파일로만 다운로드하는 것을 넘어, 시스템 간 실시간 연동이 가능하도록 API 서비스를 적극적으로 제공합니다.",
                },
                {
                  label: "시민 참여",
                  desc: "정부 기관뿐만 아니라 일반 시민, NGO, 기업도 유용한 공공데이터를 포털에 등록하고 공유할 수 있는 개방형 플랫폼 아키텍처를 채택했습니다.",
                },
                {
                  label: "AI 통합",
                  desc: "최신 기술 트렌드에 맞춰 MCP(Model Context Protocol) 서버를 도입하여 LLM 및 AI 에이전트가 공공데이터에 직접 접근하고 분석할 수 있는 기반을 마련했습니다.",
                  highlight: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex gap-4 p-4 border rounded-lg ${item.highlight ? "border-primary bg-primary/5" : "bg-card"}`}
                >
                  <div className="font-bold text-primary w-20 shrink-0 text-sm">{item.label}</div>
                  <div className="text-muted-foreground text-sm flex-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ArrowRight className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">4. 한국 시사점: data.go.kr과의 비교</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm text-left">
                <thead>
                  <tr className="bg-muted text-muted-foreground border-b">
                    <th className="p-4 font-semibold w-1/4">구분</th>
                    <th className="p-4 font-semibold">프랑스 (data.gouv.fr)</th>
                    <th className="p-4 font-semibold">대한민국 (data.go.kr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {[
                    ["기본 철학", "법적 의무화에 기반한 오픈 바이 디폴트", "신청 기반 개방 및 점진적 사전 개방 확대"],
                    ["운영 체계", "총리실 직속 강력한 전담 조직 (Etalab) 중심", "행정안전부-한국지능정보사회진흥원(NIA) 협력"],
                    ["데이터 주체", "정부 + 민간 시민 공동 기여 (크라우드소싱)", "공공기관 및 지자체 중심의 단방향 제공"],
                    ["기술 생태계", "자체 오픈소스 개발, API 우선, AI 연동(MCP)", "강력한 오픈API 허브 기능, 표준화된 메타데이터"],
                  ].map(([label, fr, kr]) => (
                    <tr key={label}>
                      <td className="p-4 font-medium bg-muted/30">{label}</td>
                      <td className="p-4">{fr}</td>
                      <td className="p-4">{kr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 p-5 bg-muted rounded-lg text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">시사점:</strong> 한국의 공공데이터 포털은 방대한
              데이터 양과 안정적인 인프라 측면에서 세계적 수준입니다. 향후 프랑스의 모델을 참고하여
              ①시민과 민간 기업이 데이터를 생산하고 공유하는 생태계 구축, ②유연한 라이선스 적용,
              ③AI 에이전트 시대에 대비한 기계 가독성 및 MCP 지원 강화가 필요합니다.
            </div>
          </section>
        </TabsContent>

        {/* ── Use Cases Tab ────────────────────────────── */}
        <TabsContent value="usecases">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold mb-1">오픈데이터 활용 사례</h2>
              <p className="text-sm text-muted-foreground">
                data.gouv.fr가 선별한 우수 활용 사례를 한국어로 소개합니다.{" "}
                <a
                  href="https://www.data.gouv.fr/fr/pages/onboarding/liste_cas_usage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5"
                >
                  원본 페이지 <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>

          <Tabs defaultValue="전체">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              {ALL_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                  {cat}
                  {cat !== "전체" && (
                    <span className="ml-1.5 text-muted-foreground text-xs">
                      {USE_CASES.find((c) => c.category === cat)?.items.length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* 전체 탭 */}
            <TabsContent value="전체">
              <div className="space-y-8">
                {USE_CASES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.category}>
                      <h3
                        className={`flex items-center gap-2 text-base font-semibold mb-4 ${cat.color}`}
                      >
                        <Icon className="h-4 w-4" />
                        {cat.category}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cat.items.map((item) => (
                          <UseCaseCard
                            key={item.original}
                            item={item}
                            categoryColor={cat.color}
                            categoryBg={cat.bg}
                            categoryBorder={cat.border}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* 카테고리별 탭 */}
            {USE_CASES.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsContent key={cat.category} value={cat.category}>
                  <div className="mb-4 flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                    <h3 className={`font-semibold text-lg ${cat.color}`}>{cat.category}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cat.items.map((item) => (
                      <UseCaseCard
                        key={item.original}
                        item={item}
                        categoryColor={cat.color}
                        categoryBg={cat.bg}
                        categoryBorder={cat.border}
                      />
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
