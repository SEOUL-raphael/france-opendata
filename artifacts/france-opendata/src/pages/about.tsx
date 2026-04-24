import {
  Building2,
  Globe,
  FileCheck,
  Server,
  Quote,
  ShieldCheck,
  ExternalLink,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const USE_CASES = [
  {
    name: "출동 위치 정밀 파악",
    original: "La prise d'appel des secours",
    description:
      "소방·응급 신고 센터에서 전국 주소 데이터베이스(BAN)를 활용해 출동 위치를 정확히 특정합니다. 주소 오류로 인한 골든타임 손실을 최소화해 구조 성공률을 높입니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/prise_appel_secours",
  },
  {
    name: "도시 수목 유산 파악",
    original: "Nos Villes Vertes",
    description:
      "지자체가 공개한 수목 데이터를 활용해 시민이 자신의 지역 나무 종류·나이·위치를 지도로 확인합니다. 도시 녹지 정책 수립과 탄소 흡수량 산정에 활용됩니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/nos_villes_vertes",
  },
  {
    name: "경영 위기 기업 조기 탐지",
    original: "Signaux Faibles",
    description:
      "SIRENE(기업등록) 데이터, 세금 납부 현황, 고용보험 정보를 결합해 경영 위기에 처한 기업을 사전 탐지합니다. 공무원이 선제적으로 지원책을 제안할 수 있게 합니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/signaux_faibles",
  },
  {
    name: "부동산 실거래가 공개",
    original: "Données de valeur foncière (DVF)",
    description:
      "프랑스 전역의 부동산 실거래 가격 데이터를 누구나 자유롭게 조회·분석할 수 있도록 공개합니다. 시민·전문가·연구자 모두 지역별·유형별 실거래가를 직접 확인할 수 있습니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/dvf",
  },
  {
    name: "농업 경영 간소화",
    original: "Ekylibre",
    description:
      "농업 보조금 신청에 필요한 필지 데이터와 작물 분류 데이터를 오픈데이터로 연동해 농업인의 행정 서류 작성 부담을 대폭 줄입니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/ekylibre",
  },
  {
    name: "진로 탐색 경로 제안",
    original: "DiagOriente",
    description:
      "직업 훈련 기관 데이터와 노동시장 통계를 결합해 개인에게 맞춤형 진로 경로를 제안합니다. 취업·재취업 지원 상담 현장에서 활발히 활용되고 있습니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/diagoriente",
  },
  {
    name: "부동산 환경 위험 정보",
    original: "ERRIAL",
    description:
      "토지 거래 전 해당 부지의 환경 오염·자연재해 위험·산업시설 인접 여부를 공공데이터로 즉시 확인합니다. 부동산 전문가와 일반 시민 모두 이용 가능합니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/errial",
  },
  {
    name: "꿀벌 서식 자원 추정",
    original: "BeeGIS",
    description:
      "위성 이미지와 토지 이용 현황 데이터를 결합해 특정 지역의 꿀벌 서식 적합성을 평가합니다. 양봉업자와 연구자가 최적 양봉 위치를 선정하는 데 활용합니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/beegis",
  },
  {
    name: "지역 재생에너지 생산 현황",
    original: "EnR de réseaux en Pays de la Loire",
    description:
      "페이드라루아르 지역의 재생에너지 네트워크 연결 현황과 생산량을 지도로 시각화합니다. 지자체와 에너지 담당 기관이 지역 에너지 전환 계획 수립에 활용합니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/EnR_PdlL",
  },
  {
    name: "기업 정보 통합 검색",
    original: "Annuaire des Entreprises",
    description:
      "SIRENE 기반 기업 정보 검색 포털입니다. 사업자 등록번호(SIRET/SIREN)로 기업의 업종·규모·법적 형태·대표자를 즉시 확인할 수 있어 행정 절차를 크게 단축합니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/annuaire-des-entreprises",
  },
  {
    name: "주유소 유가 추이 분석",
    original: "Exploration des prix du carburant",
    description:
      "프랑스 전국 1만여 개 주유소의 실시간 유가를 공개합니다. 소비자 앱·지도 서비스·언론 등 수백 개 서비스가 이 데이터를 재활용해 가격 비교 서비스를 제공합니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/prix_carburant",
  },
  {
    name: "대입 진학 경로 분석",
    original: "SupTracker",
    description:
      "파르쿠르수프(Parcoursup) 입시 데이터를 기반으로 대학별 합격 추이와 전형 패턴을 분석합니다. 수험생과 진학 담당 교사가 현실적인 진학 전략을 수립하는 데 도움을 줍니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/suptracker",
  },
  {
    name: "장소 주변 환경 정보",
    original: "Aux Alentours par MAIF",
    description:
      "MAIF 보험이 공공데이터를 활용해 특정 장소 주변의 학교·의료시설·대중교통·재해 위험 등 생활 환경 정보를 한눈에 제공하는 서비스입니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/aux-alentours-par-maif",
  },
  {
    name: "근처 위험 정보 확인",
    original: "VigiFrance",
    description:
      "기상 위험·홍수·지진·산불 등 여러 부처의 경보 데이터를 통합해 사용자 위치 기반으로 근처 위험을 실시간으로 알려주는 앱입니다.",
    url: "https://www.data.gouv.fr/pages/onboarding/vigifrance",
  },
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
        titleFr: "Producteurs de données",
        desc: "공공데이터 공개 의무 범위, 재사용 라이선스(Licence Ouverte·ODbL) 선택 기준, 개인정보 포함 데이터 처리 시 RGPD 준수 방법을 단계별로 설명합니다.",
        tags: ["Licence Ouverte", "RGPD", "공개 의무"],
        url: "https://guides.data.gouv.fr/guides/guide-juridique/producteurs-de-donnees",
      },
      {
        title: "데이터 활용자를 위한 법률 가이드",
        titleFr: "Réutilisateurs de données",
        desc: "공공데이터 재활용 시 준수해야 할 라이선스 조건, 상업적 이용 가능 여부, 원본 출처 표기 방법, 저작권 예외 케이스를 정리합니다.",
        tags: ["재사용 조건", "출처 표기", "상업적 이용"],
        url: "https://guides.data.gouv.fr/guides/guide-juridique/reutilisateurs-de-donnees",
      },
      {
        title: "프랑스 오픈데이터 역사 연대표",
        titleFr: "Chronologie de l'open data",
        desc: "2011년 data.gouv.fr 설립부터 2016년 디지털 공화국법까지 프랑스 오픈데이터 정책의 주요 이정표를 시간순으로 정리합니다.",
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
        desc: "파일 형식(CSV·JSON·Parquet) 선택, 인코딩(UTF-8), 날짜 표준화(ISO 8601), 결측치 표기 규칙 등 데이터 게시 전 체크리스트를 제공합니다.",
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
        title: "데이터셋 품질 수준 평가하기",
        titleFr: "Évaluer le niveau de qualité d'un jeu de données",
        desc: "데이터 완전성·정확성·최신성·일관성을 점검하는 품질 평가 기준과 자동화 검증 도구를 사용해 공개 전 수준을 객관적으로 측정하는 방법을 설명합니다.",
        tags: ["품질 평가", "검증", "완전성"],
        url: "https://guides.data.gouv.fr/guides/guide-qualite/evaluer-le-niveau-de-qualite-dun-jeu-de-donnees",
      },
      {
        title: "데이터 스키마 활용하기",
        titleFr: "Maîtriser les schémas de données",
        desc: "schema.data.gouv.fr에서 제공하는 표준 스키마를 채택해 여러 기관 데이터를 자동 병합·검증하는 방법을 설명합니다. TableSchema·JSON Schema 기반 유효성 검사 도구 포함.",
        tags: ["schema.data.gouv.fr", "TableSchema", "검증"],
        url: "https://guides.data.gouv.fr/guides/guide-qualite/maitriser-les-schemas-de-donnees",
      },
      {
        title: "지속적으로 데이터셋 품질 개선하기",
        titleFr: "Améliorer la qualité d'un jeu de données en continu",
        desc: "데이터 공개 이후 커뮤니티 피드백 반영, 오류 신고 처리, 정기 갱신 절차, 품질 지표 모니터링을 통해 데이터셋 품질을 지속적으로 향상시키는 방법을 다룹니다.",
        tags: ["지속 개선", "피드백", "모니터링"],
        url: "https://guides.data.gouv.fr/guides/guide-qualite/ameliorer-la-qualite-dun-jeu-de-donnees-en-continu",
      },
    ],
  },
  {
    group: "데이터 재활용하기",
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
        desc: "api-adresse.data.gouv.fr(주소 검색), 행정구역·지적도 API 등 프랑스 공공 지리정보 API를 지도·GIS 프로젝트에 연동하는 방법을 설명합니다.",
        tags: ["API", "GIS", "지도"],
        url: "https://guides.data.gouv.fr/guides/reutiliser-des-donnees/utiliser-les-api-geographiques",
      },
      {
        title: "주소 API 실습 가이드",
        titleFr: "Prendre en main l'API Adresse (IGN)",
        desc: "IGN이 제공하는 전국 주소 API(api-adresse.data.gouv.fr)를 실제로 사용해보는 실습 가이드입니다. 주소 검색·역지오코딩·배치 처리 방법을 코드 예제와 함께 설명합니다.",
        tags: ["API Adresse", "IGN", "지오코딩"],
        url: "https://guides.data.gouv.fr/guides/reutiliser-des-donnees/prendre-en-main-lapi-adresse-portee-par-lign",
      },
      {
        title: "기상 데이터 활용 입문",
        titleFr: "Prise en main des données météorologiques",
        desc: "Météo-France가 공개한 기상 관측 데이터(온도·강수량·풍속 등)를 data.gouv.fr에서 찾아 다운로드하고, 기후 분석·재난 예측 서비스에 연동하는 방법을 안내합니다.",
        tags: ["기상", "Météo-France", "기후"],
        url: "https://guides.data.gouv.fr/guides/reutiliser-des-donnees/prise-en-main-des-donnees-meteorologiques",
      },
      {
        title: "지적도(카다스트르) 데이터 활용",
        titleFr: "Autour du cadastre",
        desc: "프랑스 지적도(cadastre) 데이터의 구조와 좌표계, data.gouv.fr에서 시군구별 지적 파일 다운로드 방법, GIS 소프트웨어에서 시각화하는 절차를 다룹니다.",
        tags: ["카다스트르", "지적도", "GIS"],
        url: "https://guides.data.gouv.fr/guides/reutiliser-des-donnees/autour-du-cadastre",
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
    groupUrl:
      "https://guides.data.gouv.fr/guides/outils-pour-les-administrations",
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
        titleFr: "Bouquets API Entreprise et API Particulier",
        desc: "기업정보(SIRENE·INPI), 세금 납부 현황, 사회보험 자격 등을 실시간 조회하는 API Entreprise와 시민 개인 정보를 행정 서류 없이 확인하는 API Particulier 연동 가이드입니다.",
        tags: ["API Entreprise", "SIRENE", "행정"],
        url: "https://guides.data.gouv.fr/guides/outils-pour-les-administrations/bouquets-api-entreprise-et-api-particulier",
      },
      {
        title: "인적 지원 및 동반 서비스",
        titleFr: "Accompagnement humain",
        desc: "data.gouv.fr 팀이 제공하는 데이터 공개 지원 서비스: 기관별 맞춤 컨설팅, 워크숍, 기술 지원 채널, data.gouv.fr 커뮤니티 포럼 활용법을 안내합니다.",
        tags: ["지원", "컨설팅", "커뮤니티"],
        url: "https://guides.data.gouv.fr/guides/outils-pour-les-administrations/accompagnement-humain",
      },
    ],
  },
  {
    group: "기타 유용한 자료",
    groupFr: "Autres ressources utiles",
    groupIcon: BookOpen,
    groupColor: "text-teal-600 dark:text-teal-400",
    groupBg: "bg-teal-50 dark:bg-teal-950/20",
    groupBorder: "border-teal-200 dark:border-teal-800",
    groupUrl: "https://guides.data.gouv.fr/guides/autres-ressources-utiles",
    items: [
      {
        title: "오픈데이터 용어 사전",
        titleFr: "Lexique de l'open data",
        desc: "오픈데이터 분야에서 자주 등장하는 핵심 용어(라이선스·API·메타데이터·RGPD 등)를 프랑스어 원어와 함께 명확하게 정의한 공식 용어 사전입니다.",
        tags: ["용어집", "입문", "레퍼런스"],
        url: "https://guides.data.gouv.fr/guides/autres-ressources-utiles/lexique-de-lopen-data",
      },
      {
        title: "공공 소스코드 공개 가이드",
        titleFr:
          "Codes sources du secteur public — lesquels ouvrir, pourquoi et comment",
        desc: "공공기관이 개발한 소프트웨어 소스코드를 오픈소스로 공개해야 하는 법적 의무 범위, 공개 방법(GitHub·gitlab.com), 라이선스 선택 기준을 다룹니다.",
        tags: ["소스코드", "오픈소스", "공개 의무"],
        url: "https://guides.data.gouv.fr/guides/autres-ressources-utiles/codes-sources-du-secteur-public-lesquels-ouvrir-pourquoi-et-comment",
      },
      {
        title: "공공 알고리즘 설명 의무",
        titleFr: "Les algorithmes publics — pourquoi et comment les expliquer",
        desc: "행정 결정에 사용되는 알고리즘을 시민에게 설명해야 하는 법적 의무(디지털 공화국법)와 실제로 어떻게 알고리즘 로직을 이해하기 쉽게 공개하는지 안내합니다.",
        tags: ["알고리즘", "투명성", "설명 의무"],
        url: "https://guides.data.gouv.fr/guides/autres-ressources-utiles/les-algorithmes-publics-pourquoi-et-comment-les-expliquer",
      },
      {
        title: "기후 해커톤 참가자 가이드",
        titleFr: "Guide du participant au hackathon 'Le climat en données'",
        desc: "data.gouv.fr가 주관한 기후 데이터 해커톤 참가자를 위한 안내서입니다. 활용 가능한 기후·환경 데이터셋 목록, API 접근 방법, 심사 기준을 담고 있습니다.",
        tags: ["해커톤", "기후", "환경"],
        url: "https://guides.data.gouv.fr/guides/autres-ressources-utiles/guide-du-participant-au-hackathon-le-climat-en-donnees",
      },
    ],
  },
];

function UseCaseCard({ item }: { item: (typeof USE_CASES)[0] }) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base leading-snug">{item.name}</CardTitle>
        <CardDescription className="text-xs italic">
          {item.original}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      </CardContent>
      <div className="px-6 pb-5">
        <Button variant="outline" size="sm" asChild className="w-full">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5"
          >
            data.gouv.fr에서 보기 <ExternalLink className="h-3.5 w-3.5" />
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
    desc: "2025년 11월 Model Context Protocol(MCP) 서버(mcp.data.gouv.fr/mcp)를 처음 공개하고, LLM 및 AI 에이전트가 공공데이터를 직접 검색·조회·분석할 수 있는 기반을 갖추었습니다. search_datasets, get_dataset_info, query_resource_data 등 9개 표준 도구를 JSON-RPC 2.0 방식으로 제공합니다.",
    highlight: true,
    tag: "MCP · JSON-RPC · LLM 연동",
  },
];

export default function About() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <div className="text-center mb-10 space-y-3">
        <Badge
          variant="outline"
          className="text-primary border-primary/30 bg-primary/5 px-3 py-1"
        >
          Policy Brief
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          프랑스 공공데이터 포털 벤치마킹
        </h1>
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
              프랑스의 공공데이터 포털 <strong>data.gouv.fr</strong>는 2011년
              François Fillon 총리의 통달로 설립되었습니다. 현재는 총리실 직속의
              디지털 정부 태스크포스인 <strong>Etalab(에탈랍)</strong>이 운영을
              전담하고 있습니다. Etalab은 단순한 포털 운영을 넘어 프랑스 정부의
              데이터 전략, AI 활용, 오픈소스 정책을 총괄하는 핵심 조직입니다.
            </p>
            <Card className="mt-8 border-l-4 border-l-primary bg-primary/5">
              <CardContent className="p-6 relative">
                <Quote className="absolute top-4 left-4 h-12 w-12 text-primary/10 -z-10" />
                <blockquote className="text-lg font-medium text-foreground italic pl-6">
                  "공공데이터는 원칙적으로 공개되어야 하며, 이는 국가의 투명성과
                  혁신을 위한 기반이다."
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
              <h2 className="text-2xl font-bold">
                2. 핵심 철학: 오픈 바이 디폴트
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">기본 공개 원칙</h3>
                  <p className="text-muted-foreground text-sm">
                    2016년 디지털 공화국법(Loi pour une République numérique)을
                    통해 특정 예외를 제외한 모든 정부 데이터의 기본 공개를
                    법제화했습니다.
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
                    출처 표기만을 요구하는 유연한 자체 오픈 라이선스(Licence
                    Ouverte)를 개발해 데이터의 상업적·비상업적 재사용을
                    극대화했습니다.
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
                      <div
                        className={`p-2 rounded-lg ${item.highlight ? "bg-primary/10" : "bg-muted"}`}
                      >
                        <Icon
                          className={`h-4 w-4 ${item.highlight ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`font-semibold text-sm ${item.highlight ? "text-primary" : "text-foreground"}`}
                        >
                          {item.label}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-mono">
                          {item.tag}
                        </span>
                        {item.highlight && (
                          <Badge className="text-xs" variant="default">
                            신기능
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </TabsContent>

        {/* ── Use Cases Tab ────────────────────────────── */}
        <TabsContent value="usecases">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">오픈데이터 활용 사례</h2>
            <p className="text-sm text-muted-foreground">
              data.gouv.fr가 선별한 14개의 우수 활용 사례를 한국어로 소개합니다.{" "}
              <a
                href="https://www.data.gouv.fr/pages/onboarding/liste_cas_usage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5"
              >
                원본 페이지 <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map((item) => (
              <UseCaseCard key={item.original} item={item} />
            ))}
          </div>
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
                  Etalab이 공식 제공하는 가이드를 한국어로 번역·요약했습니다. 각
                  카드의 링크를 클릭하면 프랑스어 원문 가이드로 이동합니다.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 shrink-0"
              >
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
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {GUIDES.map((group) => {
                  const Icon = group.groupIcon;
                  return (
                    <div
                      key={group.group}
                      className={`rounded-lg border p-3 ${group.groupBg} ${group.groupBorder} text-center`}
                    >
                      <Icon
                        className={`h-5 w-5 mx-auto mb-1.5 ${group.groupColor}`}
                      />
                      <p className="text-xs font-semibold text-foreground">
                        {group.group}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {group.items.length}개 가이드
                      </p>
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
                    <h3 className={`font-semibold text-lg ${group.groupColor}`}>
                      {group.group}
                    </h3>
                    <span className="text-xs text-muted-foreground italic">
                      — {group.groupFr}
                    </span>
                    <Badge variant="outline" className="text-xs ml-1">
                      {group.items.length}개
                    </Badge>
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
                          <ArrowUpRight
                            className={`h-4 w-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${group.groupColor}`}
                          />
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

                        <div
                          className={`mt-3 pt-3 border-t flex items-center gap-1 text-xs ${group.groupColor} font-medium`}
                        >
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
