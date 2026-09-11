import { ArrowUpRight, CheckCircle2, ExternalLink, Landmark } from "lucide-react";

const PUBLIC_SITE_URL = "https://seoul-raphael.github.io/france-opendata/";

export default function MigrationNotice() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-primary">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Landmark className="h-5 w-5" aria-hidden="true" />
          </span>
          프랑스 공공데이터 정책 벤치마크
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white px-6 py-8 sm:px-10 sm:py-10">
            <p className="mb-3 text-sm font-semibold text-primary">서비스 이전 안내</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              새 사이트로 이전했습니다
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              프랑스 공공데이터 탐색 및 AI 정책 분석 서비스는 GitHub Pages 기반의
              새 사이트에서 운영됩니다. 최신 데이터 탐색 기능과 실시간 분석 진행
              상황은 새 사이트에서 이용해 주세요.
            </p>
          </div>

          <div className="px-6 py-7 sm:px-10 sm:py-9">
            <a
              href={PUBLIC_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
            >
              새 사이트 열기
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>
                  <h2 className="font-semibold">공개 서비스</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    데이터셋 탐색, 원문 출처 확인, AI 기반 정책 참고 분석을 새 사이트에서 제공합니다.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="font-semibold">내부 운영 자료</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    기관 내부 참고용 소스와 운영 문서는 별도 Internal GitLab 저장소에서 관리합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-sm text-slate-500">
          정책 검토 시 AI 분석 결과와 함께 원문 출처 및 최신 제도 정보를 확인해 주세요.
        </p>
      </div>
    </main>
  );
}