# 프랑스 공공데이터 정책 벤치마크

대한민국 공공기관의 데이터 정책 담당자가 프랑스 `data.gouv.fr`의 공개데이터 운영 방식과 활용 사례를 참고할 수 있도록 만든 한국어 탐색 도구입니다.

## 서비스 목적

- 프랑스 공공데이터 포털의 데이터셋·기관·API 서비스를 한국어로 검색
- 데이터 개방 범위, 제공 형식, 운영 주체, 재사용 사례를 빠르게 비교
- AI 분석을 통해 국내 공공데이터 정책·서비스 개선에 참고할 수 있는 시사점 정리
- 검색 결과의 원문 링크와 출처를 함께 확인하여 정책 검토의 추적성 확보

이 프로젝트는 프랑스의 제도를 그대로 복제하기 위한 것이 아니라, 대한민국 공공데이터 개방·품질·활용 정책을 검토하기 위한 **참고용 벤치마크**입니다. AI가 생성한 분석은 정책 결정이나 법률·조달 판단을 대신하지 않으며, 최종 검토 시 원문 출처와 최신 제도·법령을 확인해야 합니다.

## 사용 중인 서비스

- 공개 웹 데모: <https://seoul-raphael.github.io/france-opendata/>
- 프랑스 원천 포털: <https://www.data.gouv.fr/>
- AI 프록시: Cloudflare Workers
- 프런트엔드: React + Vite + TypeScript + Tailwind CSS
- 패키지 관리: pnpm

## 주요 기능

- 데이터셋 검색 및 상세 정보 확인
- 데이터 제공 기관·API 서비스 탐색
- 리소스 형식·다운로드 주소·라이선스 확인
- AI 기반 한국어 정책 활용 분석
- AI 도구 호출 및 추론 진행 상황의 실시간 표시
- 검색 결과와 원문 링크를 함께 제공

## 배포 구성

```text
사용자 브라우저
    │
    ├── GitHub Pages 또는 내부 GitLab 저장소에서 관리되는 프런트엔드
    │
    └── Cloudflare Worker
          ├── MiniMax AI
          └── data.gouv.fr API
```

프런트엔드는 정적 웹 앱이며, AI API 키는 브라우저나 저장소에 넣지 않습니다. 브라우저는 Worker의 `/api/chat`에 요청하고, Worker가 AI 및 data.gouv.fr 호출을 처리합니다. 분석 진행 상황은 SSE(Server-Sent Events)로 브라우저에 전달됩니다.

## 로컬 실행

```bash
pnpm install
pnpm --filter @workspace/france-opendata run dev
```

웹 앱을 GitHub Pages 또는 다른 정적 호스팅에서 빌드할 때는 다음 값을 설정합니다.

```text
VITE_WORKER_URL=https://<your-worker-domain>
VITE_GITHUB_PAGES_BASE=/<repository-name>/
```

Worker 설정과 배포 방법은 [`cloudflare-worker/README.md`](./cloudflare-worker/README.md)를 확인하세요.

## 내부기관용 배포

기관 내부 검토본은 GitLab 프로젝트의 가시성을 **Internal(내부)**로 설정하여 승인된 GitLab 로그인 사용자만 저장소를 조회할 수 있도록 운영합니다.

- 저장소에 API 키, OAuth 토큰, `.env`, `.dev.vars`, 개인 식별정보를 커밋하지 않습니다.
- GitLab CI/CD 변수와 Cloudflare Secret에 비밀값을 저장하고, 로그에 출력하지 않습니다.
- 내부 저장소의 접근권한은 기관의 최소권한 원칙에 따라 부여합니다.
- 공개 웹 데모를 계속 운영할 경우 공개 URL과 내부 저장소의 설명·데이터 취급 범위를 구분합니다.
- 외부 원천 데이터의 이용 조건과 라이선스는 각 원문 페이지에서 최종 확인합니다.

## 검증 명령

```bash
pnpm --filter @workspace/france-opendata run build
```

전체 보안 검토 시에는 의존성 취약점, 정적 코드 분석, 개인정보·비밀정보 흐름을 각각 확인합니다. 취약점 점검 결과는 특정 시점의 도구 결과이므로 운영 반영 전 다시 실행해야 합니다.

## 보안 및 책임 범위

- AI 입력에는 업무상 비공개 정보, 개인정보, 인증정보를 넣지 않습니다.
- 공개 데이터라도 재식별 가능성, 이용조건, 최신성은 별도로 검토합니다.
- 검색 결과와 AI 분석은 참고 자료이며 공문서·정책 결정의 원문 근거를 대체하지 않습니다.
- 보안 문제를 발견하면 공개 이슈에 민감정보를 올리지 말고 저장소 관리자에게 비공개로 신고합니다.

## 라이선스 및 출처

애플리케이션 코드는 저장소의 라이선스 정책을 따릅니다. 검색되는 데이터와 문서의 권리·라이선스는 각 제공기관 및 `data.gouv.fr`의 원문 조건을 따릅니다.