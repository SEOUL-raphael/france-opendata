import { Building2, Globe, FileCheck, Server, ArrowRight, Quote, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function About() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 font-sans">
      
      <div className="text-center mb-16 space-y-4">
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-3 py-1">Policy Brief</Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          프랑스 공공데이터 포털 벤치마킹
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          대한민국 디지털 플랫폼 정부 구현을 위한 data.gouv.fr 분석 보고서
        </p>
      </div>

      <div className="space-y-16">
        
        {/* Section 1: Background */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">1. 탄생 배경 및 운영 주체</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed">
            <p>
              프랑스의 공공데이터 포털 <strong>data.gouv.fr</strong>는 2011년 François Fillon 총리의 통달로 설립되었습니다. 현재는 총리실 직속의 디지털 정부 태스크포스인 <strong>Etalab(에탈랍)</strong>이 운영을 전담하고 있습니다. Etalab은 단순한 포털 운영을 넘어 프랑스 정부의 데이터 전략, AI 활용, 오픈소스 정책을 총괄하는 핵심 조직입니다.
            </p>
          </div>
          
          <Card className="mt-8 border-l-4 border-l-primary bg-primary/5">
            <CardContent className="p-6 relative">
              <Quote className="absolute top-4 left-4 h-12 w-12 text-primary/10 -z-10" />
              <blockquote className="text-lg font-medium text-foreground italic relative z-10 pl-6">
                "공공데이터는 원칙적으로 공개되어야 하며, 이는 국가의 투명성과 혁신을 위한 기반이다."
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Philosophy */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">2. 핵심 철학: 오픈 바이 디폴트 (Open by Default)</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-muted rounded-full text-foreground">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">기본 공개 원칙</h3>
                <p className="text-muted-foreground text-sm">
                  2016년 디지털 공화국법(Loi pour une République numérique)을 통해 특정 예외(국가 안보, 개인정보 등)를 제외한 모든 정부 데이터의 기본 공개를 법제화했습니다.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-muted rounded-full text-foreground">
                  <FileCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Etalab 라이선스</h3>
                <p className="text-muted-foreground text-sm">
                  출처 표기만을 요구하는 매우 유연한 자체 오픈 라이선스(Licence Ouverte)를 개발하여 채택함으로써 데이터의 상업적/비상업적 재사용을 극대화했습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Technical Features */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Server className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">3. 주요 기술적 특징</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4 p-4 border rounded-lg bg-card">
              <div className="font-bold text-primary w-24 shrink-0">API 우선</div>
              <div className="text-muted-foreground text-sm flex-1">
                데이터를 파일로만 다운로드하는 것을 넘어, 시스템 간 실시간 연동이 가능하도록 API 서비스를 적극적으로 제공합니다.
              </div>
            </div>
            <div className="flex gap-4 p-4 border rounded-lg bg-card">
              <div className="font-bold text-primary w-24 shrink-0">시민 참여</div>
              <div className="text-muted-foreground text-sm flex-1">
                정부 기관뿐만 아니라 일반 시민, NGO, 기업도 유용한 공공데이터를 포털에 등록하고 공유할 수 있는 개방형 플랫폼 아키텍처를 채택했습니다.
              </div>
            </div>
            <div className="flex gap-4 p-4 border rounded-lg bg-card border-primary bg-primary/5">
              <div className="font-bold text-primary w-24 shrink-0">AI 통합</div>
              <div className="text-muted-foreground text-sm flex-1">
                최신 기술 트렌드에 맞춰 MCP(Model Context Protocol) 서버를 도입하여 LLM 및 AI 에이전트가 공공데이터에 직접 접근하고 분석할 수 있는 기반을 마련했습니다.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Comparison */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowRight className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">4. 한국 시사점: data.go.kr 과의 비교</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="bg-muted text-muted-foreground border-b">
                  <th className="p-4 font-semibold w-1/4">구분</th>
                  <th className="p-4 font-semibold w-[37.5%]">프랑스 (data.gouv.fr)</th>
                  <th className="p-4 font-semibold w-[37.5%]">대한민국 (data.go.kr)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                <tr>
                  <td className="p-4 font-medium bg-muted/30">기본 철학</td>
                  <td className="p-4">법적 의무화에 기반한 오픈 바이 디폴트</td>
                  <td className="p-4">신청 기반 개방 및 점진적 사전 개방 확대</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium bg-muted/30">운영 체계</td>
                  <td className="p-4">총리실 직속의 강력한 전담 조직 (Etalab) 중심</td>
                  <td className="p-4">행정안전부-한국지능정보사회진흥원(NIA) 협력 구조</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium bg-muted/30">데이터 주체</td>
                  <td className="p-4">정부 + 민간 시민 공동 기여 (크라우드소싱)</td>
                  <td className="p-4">공공기관 및 지자체 중심의 단방향 제공</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium bg-muted/30">기술 생태계</td>
                  <td className="p-4">자체 오픈소스 개발, API 우선, 최신 AI 연동(MCP)</td>
                  <td className="p-4">강력한 오픈API 허브 기능, 표준화된 메타데이터</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-6 bg-muted rounded-lg text-sm text-muted-foreground leading-relaxed">
            <strong>시사점:</strong> 한국의 공공데이터 포털은 방대한 데이터 양과 안정적인 인프라 측면에서 세계적 수준입니다. 향후 프랑스의 모델을 참고하여 ①시민과 민간 기업이 데이터를 생산하고 공유하는 생태계 구축, ②특정 목적에 구애받지 않는 유연한 라이선스 적용, ③AI 에이전트 시대에 대비한 기계 가독성(Machine-readability) 및 MCP 지원 강화가 필요할 것으로 분석됩니다.
          </div>
        </section>

      </div>
    </div>
  );
}
