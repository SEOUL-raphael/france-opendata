import {
  Building2,
  Globe,
  FileCheck,
  Server,
  Quote,
  ShieldCheck,
  ExternalLink,
  Zap,
  Leaf,
  TrendingUp,
  MapPin,
  GraduationCap,
  HeartPulse,
  Code2,
  BookOpen,
  Users,
  Scale,
  Cpu,
  Database,
  CheckCircle,
  ArrowUpRight,
  Layers,
  GitBranch,
  FileJson,
  Network,
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

const GUIDES = [
  {
    group: "법적 가이드",
    groupFr: "Guide juridique",
    groupIcon: Scale,
    groupColor: "text-purple-600 dark:text-purple-400",
    groupBg: "bg-purple-50 dark:bg-purple-950/20",
    groupBorder: "border-purple-200 dark:border-purple-800",
    groupUrl: "https://guides.data.gouv.fr/guides/guide-juridique",
    items: [
      {
        title: "데이터 생산자를 위한 법률 가이드",
        titleFr: "Guide juridique — producteurs de données",
        desc: "공공데이터 공개 의무 범위, 재사용 라이선스(Licence Ouverte·ODbL) 선택 기준, 개인정보 포함 데이터 처리 시 RGPD 준수 방법을 단계별로 설명합니다.",
        tags: ["Licence Ouverte", "RGPD", "공개 의무"],
        url: "https://guides.data.gouv.fr/guides/guide-juridique/producteurs-de-donnees",
      },
      {
        title: "데이터 활용자를 위한 법률 가이드",
        titleFr: "Guide juridique — réutilisateurs de données",
        desc: "공공데이터 재활용 시 준수해야 할 라이선스 조건, 상업적 이용 가능 여부, 원본 출처 표기 방법, 저작권 예외 케이스를 정리합니다.",
        tags: ["재사용 조건", "출처 표기", "상업적 이용"],
        url: "https://guides.data.gouv.fr/guides/guide-juridique/reutilisateurs-de-donnees",
      },
      {
        title: "프랑스 오픈데이터 역사 연대표",
        titleFr: "Chronologie de l'open data",
        desc: "2011년 data.gouv.fr 설립부터 2016년 디지털 공화국법, 2024년 MCP 도입까지 프랑스 오픈데이터 정책의 주요 이정표를 시간순으로 정리합니다.",
        tags: ["역사", "정책", "법제도"],
        url: "https://guides.data.gouv.fr/guides/guide-juridique/chronologie-de-lopen-data",
      },
    ],
  },
  {
    group: "데이터 품질 가이드",
    groupFr: "Guide qualité",
    groupIcon: Database,
    groupColor: "text-blue-600 dark:text-blue-400",
    groupBg: "bg-blue-50 dark:bg-blue-950/20",
    groupBorder: "border-blue-200 dark:border-blue-800",
    groupUrl: "https://guides.data.gouv.fr/guides/guide-qualite",
    items: [
      {
        title: "품질 높은 데이터셋 준비하기",
        titleFr: "Préparer un jeu de données de qualité",
        desc: "파일 형식(CSV·JSON·Parquet) 선택, 인코딩(UTF-8), 날짜 표준화(ISO 8601), 결측치 표기 규칙, 컬럼 명칭 명확화 등 데이터 게시 전 체크리스트를 제공합니다.",
        tags: ["CSV", "UTF-8", "ISO 8601"],
        url: "https://guides.data.gouv.fr/guides/guide-qualite/preparer-un-jeu-de-donnees-de-qualite",
      },
      {
        title: "데이터 문서화 방법",
        titleFr: "Documenter des données",
        desc: "데이터셋 제목·설명·태그 작성 요령, 리소스별 메타데이터 표기, 갱신 주기·출처·연락처 등 DCAT 호환 메타데이터 필드 채우는 방법을 안내합니다.",
        tags: ["메타데이터", "DCAT", "문서화"],
        url: "https://guides.data.gouv.fr/guides/guide-qualite/documenter-des-donnees",
      },
      {
        title: "데이터 스키마 활용하기",
        titleFr: "Maîtriser les schémas de données",
        desc: "schema.data.gouv.fr에서 제공하는 표준 스키마를 채택해 여러 기관 데이터를 자동 병합·검증하는 방법을 설명합니다. TableSchema·JSON Schema 기반 유효성 검사 도구 활용법 포함.",
        tags: ["schema.data.gouv.fr", "TableSchema", "검증"],
        url: "https://guides.data.gouv.fr/guides/guide-qualite/maitriser-les-schemas-de-donnees",
      },
    ],
  },
  {
    group: "데이터 활용하기",
    groupFr: "Réutiliser des données",
    groupIcon: Code2,
    groupColor: "text-green-700 dark:text-green-400",
    groupBg: "bg-green-50 dark:bg-green-950/20",
    groupBorder: "border-green-200 dark:border-green-800",
    groupUrl: "https://guides.data.gouv.fr/guides/reutiliser-des-donnees",
    items: [
      {
        title: "오픈데이터 입문",
        titleFr: "Introduction à l'open data",
        desc: "오픈데이터의 정의·유형·법적 근거, data.gouv.fr 포털 검색 및 다운로드 방법, 라이선스 확인 절차를 처음 접하는 사람 기준으로 쉽게 설명합니다.",
        tags: ["입문", "검색", "다운로드"],
        url: "https://guides.data.gouv.fr/guides/reutiliser-des-donnees/introduction-a-lopen-data",
      },
      {
        title: "데이터 처리·분석 가이드",
        titleFr: "Guide traitement et analyse de données",
        desc: "Python·R을 활용한 CSV 파일 전처리, 결합·필터링·집계, 시각화, Jupyter Notebook 연동까지 실무 데이터 분석 워크플로우를 단계별 코드 예제와 함께 안내합니다.",
        tags: ["Python", "R", "분석"],
        url: "https://guides.data.gouv.fr/guides/reutiliser-des-donnees/guide-traitement-et-analyse-de-donnees",
      },
      {
        title: "지리정보 API 활용",
        titleFr: "Utiliser les API géographiques",
        desc: "api-adresse.data.gouv.fr(주소 검색), api.gouv.fr/les-api 카탈로그, 행정구역·지적도 API 등 프랑스 공공 지리정보 API를 지도·GIS 프로젝트에 연동하는 방법을 설명합니다.",
        tags: ["API", "GIS", "지도"],
        url: "https://guides.data.gouv.fr/guides/reutiliser-des-donnees/utiliser-les-api-geographiques",
      },
    ],
  },
  {
    group: "행정기관 도구",
    groupFr: "Outils pour les administrations",
    groupIcon: Users,
    groupColor: "text-orange-600 dark:text-orange-400",
    groupBg: "bg-orange-50 dark:bg-orange-950/20",
    groupBorder: "border-orange-200 dark:border-orange-800",
    groupUrl: "https://guides.data.gouv.fr/guides/outils-pour-les-administrations",
    items: [
      {
        title: "API 원칙과 설계 가이드",
        titleFr: "Doctrine des API",
        desc: "프랑스 디지털 정부의 API 설계 원칙: REST·OpenAPI 표준 준수, 버전 관리, 인증(OAuth2·API 키), 속도 제한, api.gouv.fr 카탈로그 등록 절차를 정리합니다.",
        tags: ["REST", "OpenAPI", "OAuth2"],
        url: "https://guides.data.gouv.fr/guides/outils-pour-les-administrations/doctrine-des-api",
      },
      {
        title: "DataPass — API 인가 신청 도구",
        titleFr: "DataPass — outil d'habilitations",
        desc: "민감 데이터 API(FranceConnect, API Entreprise 등) 접근 인가를 온라인으로 신청·심사·발급하는 DataPass 플랫폼 사용 방법을 안내합니다. 공공기관·기업 담당자 모두 해당.",
        tags: ["DataPass", "인가", "민감 데이터"],
        url: "https://guides.data.gouv.fr/guides/outils-pour-les-administrations/datapass-outil-dhabilitations",
      },
      {
        title: "API Entreprise·API Particulier 활용",
        titleFr: "API Entreprise et API Particulier",
        desc: "기업정보(SIRENE·INPI), 세금 납부 현황, 사회보험 자격 등을 실시간 조회하는 API Entreprise와 시민 개인 정보를 행정 서류 없이 확인하는 API Particulier 연동 가이드입니다.",
        tags: ["API Entreprise", "SIRENE", "행정"],
        url: "https://guides.data.gouv.fr/guides/outils-pour-les-administrations/bouquets-api-entreprise-et-api-particulier",
      },
    ],
  },
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

const TECH_FEATURES = [
  {
    icon: Network,
    label: "API 우선 설계",
    desc: "모든 데이터셋과 메타데이터는 REST API(api.data.gouv.fr/api/1)로 완전히 접근 가능합니다. Swagger/OpenAPI 문서가 공개되어 있으며, 실시간 검색·다운로드 URL 생성·조직 정보 조회 등을 프로그래밍 방식으로 처리할 수 있습니다.",
    highlight: false,
    tag: "REST · OpenAPI · JSON",
  },
  {
    icon: GitBranch,
    label: "완전 오픈소스 플랫폼",
    desc: "포털을 구동하는 핵심 엔진 udata는 GNU AGPL 라이선스로 GitHub에 완전 공개되어 있습니다(github.com/opendatateam/udata). 누구든 동일한 플랫폼을 자국에 배포하거나 기능을 기여할 수 있으며, 실제로 룩셈부르크·모로코 등 여러 국가가 udata를 자국 공공데이터 포털로 채택했습니다.",
    highlight: false,
    tag: "GNU AGPL · udata",
  },
  {
    icon: FileJson,
    label: "데이터 스키마 표준화",
    desc: "schema.data.gouv.fr을 통해 공통 데이터 구조(스키마)를 중앙 관리합니다. 지자체 예산, 주차장, 도로 등 수십 개 도메인의 표준 스키마가 정의되어 있으며, 데이터 게시 시 자동 유효성 검증(Validation API)이 적용됩니다. 이를 통해 여러 기관의 데이터를 손쉽게 병합·분석할 수 있습니다.",
    highlight: false,
    tag: "schema.data.gouv.fr · 유효성 검증",
  },
  {
    icon: Users,
    label: "커뮤니티 개방 기여",
    desc: "계정을 등록한 누구나(시민, 기업, 연구자, NGO 등) 데이터셋을 게시하고 공유할 수 있습니다. 다만 실제 '공공기관 인증 배지(certified)'는 공공기관 계정에만 부여됩니다. 또한 각 데이터셋에 '토론(Discussion)' 기능이 있어 데이터 오류 신고·개선 요청·활용 공유가 가능하며, 자신의 활용 사례를 '재사용(Réutilisation)'으로 등록해 데이터 공급자에게 피드백을 전달할 수 있습니다.",
    highlight: false,
    tag: "커뮤니티 · 토론 · Réutilisation",
  },
  {
    icon: Layers,
    label: "연계 특화 포털 생태계",
    desc: "data.gouv.fr 단일 포털 외에 교통(transport.data.gouv.fr), 주소(adresse.data.gouv.fr), 지리정보(geo.data.gouv.fr), 기업정보(annuaire-entreprises.data.gouv.fr) 등 도메인별 특화 포털이 별도 운영됩니다. 각 포털은 동일한 API 인프라를 공유하며 데이터를 상호 참조합니다.",
    highlight: false,
    tag: "도메인별 포털 · 연계 API",
  },
  {
    icon: Cpu,
    label: "AI 에이전트 연동 (MCP)",
    desc: "2024년 말부터 Model Context Protocol(MCP) 서버(mcp.data.gouv.fr/mcp)를 운영해 LLM 및 AI 에이전트가 공공데이터를 직접 검색·조회·분석할 수 있는 기반을 갖추었습니다. search_datasets, get_dataset_info, query_resource_data 등 9개 표준 도구를 JSON-RPC 2.0 방식으로 제공합니다.",
    highlight: true,
    tag: "MCP · JSON-RPC · LLM 연동",
  },
];

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
          <TabsTrigger value="guides">가이드</TabsTrigger>
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

          {/* Section 3 — enhanced */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Server className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">3. 주요 기술적 특징</h2>
            </div>
            <div className="space-y-3">
              {TECH_FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex gap-4 p-4 border rounded-lg transition-colors ${
                      item.highlight
                        ? "border-primary bg-primary/5"
                        : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <div className={`p-2 rounded-lg ${item.highlight ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`h-4 w-4 ${item.highlight ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`font-semibold text-sm ${item.highlight ? "text-primary" : "text-foreground"}`}>
                          {item.label}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-mono">
                          {item.tag}
                        </span>
                        {item.highlight && (
                          <Badge className="text-xs" variant="default">신기능</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
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

            <TabsContent value="전체">
              <div className="space-y-8">
                {USE_CASES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.category}>
                      <h3 className={`flex items-center gap-2 text-base font-semibold mb-4 ${cat.color}`}>
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

        {/* ── Guides Tab ───────────────────────────────── */}
        <TabsContent value="guides">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  공식 가이드 (guides.data.gouv.fr)
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Etalab이 공식 제공하는 가이드를 한국어로 번역·요약했습니다.
                  각 카드의 링크를 클릭하면 프랑스어 원문 가이드로 이동합니다.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="gap-1.5 shrink-0">
                <a
                  href="https://guides.data.gouv.fr/guides"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  원문 사이트 열기
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>

            {/* Overview window */}
            <div className="mt-5 rounded-xl border bg-gradient-to-br from-primary/5 to-background overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">
                  guides.data.gouv.fr/guides
                </span>
                <a
                  href="https://guides.data.gouv.fr/guides"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  원문 보기 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GUIDES.map((group) => {
                  const Icon = group.groupIcon;
                  return (
                    <div
                      key={group.group}
                      className={`rounded-lg border p-3 ${group.groupBg} ${group.groupBorder} text-center`}
                    >
                      <Icon className={`h-5 w-5 mx-auto mb-1.5 ${group.groupColor}`} />
                      <p className="text-xs font-semibold text-foreground">{group.group}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{group.items.length}개 가이드</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Guide groups */}
          <div className="space-y-8">
            {GUIDES.map((group) => {
              const GroupIcon = group.groupIcon;
              return (
                <div key={group.group}>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <GroupIcon className={`h-5 w-5 ${group.groupColor}`} />
                    <h3 className={`font-semibold text-lg ${group.groupColor}`}>{group.group}</h3>
                    <span className="text-xs text-muted-foreground italic">— {group.groupFr}</span>
                    <Badge variant="outline" className="text-xs ml-1">{group.items.length}개</Badge>
                    <a
                      href={group.groupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`ml-auto text-xs flex items-center gap-1 ${group.groupColor} hover:underline`}
                    >
                      전체 보기 <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.map((guide) => (
                      <a
                        key={guide.titleFr}
                        href={guide.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors">
                              {guide.title}
                            </p>
                            <p className="text-xs text-muted-foreground italic mt-0.5">
                              {guide.titleFr}
                            </p>
                          </div>
                          <ArrowUpRight className={`h-4 w-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${group.groupColor}`} />
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                          {guide.desc}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {guide.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className={`mt-3 pt-3 border-t flex items-center gap-1 text-xs ${group.groupColor} font-medium`}>
                          <CheckCircle className="h-3 w-3" />
                          guides.data.gouv.fr 공식 가이드
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
