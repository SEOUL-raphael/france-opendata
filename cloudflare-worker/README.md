# france-opendata Cloudflare Worker

MiniMax AI + data.gouv.fr tool-calling proxy for the GitHub Pages frontend.

## Architecture

```
GitHub Pages (React + Vite)
        │  POST /api/chat  { query }
        ▼
Cloudflare Worker  ──tool calls──▶  data.gouv.fr API
        │
        │  SSE: 상태·도구 호출·도구 결과·최종 답변
        ▼
    Browser
```

## Prerequisites

- Node.js 20+
- A [Cloudflare account](https://dash.cloudflare.com) (free tier works)
- A MiniMax API key from [minimax.io](https://www.minimax.io)

## Setup & Deploy

```bash
# 1. Install dependencies
cd cloudflare-worker
npm install

# 2. Log in to Cloudflare
npx wrangler login

# 3. Edit wrangler.toml — set your GitHub username
#    ALLOWED_ORIGIN = "https://YOUR_GITHUB_USERNAME.github.io"

# 4. Deploy the Worker
npx wrangler deploy

# 5. Register the MiniMax API key as a secret (never put it in wrangler.toml!)
npx wrangler secret put MINIMAX_API_KEY
# Paste your key when prompted

# 6. (Optional) Override the default AI endpoint / model
npx wrangler secret put AI_INTEGRATIONS_OPENAI_BASE_URL
# e.g. https://api.minimax.io/v1
```

After deploying, Cloudflare will print the Worker URL:
```
https://france-opendata-worker.YOUR_CF_SUBDOMAIN.workers.dev
```

Copy this URL — you will need it for the GitHub Pages build.

## Local Development

```bash
# Create .dev.vars (never commit this file!)
cat > .dev.vars << 'EOF'
MINIMAX_API_KEY=your_key_here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.minimax.io/v1
AI_MODEL=MiniMax-M2.7
ALLOWED_ORIGIN=http://localhost:5173
EOF

# Start local dev server (listens on http://localhost:8787)
npm run dev
```

In the frontend repo, set:
```
VITE_WORKER_URL=http://localhost:8787
```

## API

### `POST /api/chat`

**Request:**
```json
{ "query": "파리 인구 관련 데이터셋을 찾아줘" }
```

**Response:** `text/event-stream` (SSE)

응답이 완성될 때까지 기다리지 않고, UI에 필요한 이벤트를 순서대로 전송합니다.

```text
event: status
data: {"step":"searching","message":"AI 추론 시작 중..."}

event: tool_call
data: {"name":"search_datasets","args":{"query":"paris population"},"callCount":1}

event: tool_result
data: {"name":"search_datasets","callCount":1,"result":[...]}

event: content
data: {"content":"...최종 분석 결과..."}

event: done
data: {}
```

### `GET /api/health`

Returns `{ "status": "ok", "model": "MiniMax-M2.7" }`.

## Workers Plan Notes

The agentic loop can run up to 50 tool-calling iterations, which may exceed
the **10 ms CPU time** limit on the Workers Free plan for complex queries.

Options:
- Upgrade to **Workers Paid** (5 USD/month) and uncomment the `[limits]` block
  in `wrangler.toml` to allow up to 30 s CPU time.
- Or reduce `MAX_LOOPS` in `src/index.ts` for simpler queries.

## wrangler.toml Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ALLOWED_ORIGIN` | Yes | Your GitHub Pages URL (for CORS) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | No | Defaults to `https://api.minimax.io/v1` |
| `AI_MODEL` | No | Defaults to `MiniMax-M2.7` |
| `MINIMAX_API_KEY` | **Secret** | Set via `wrangler secret put` |

## Security

- `MINIMAX_API_KEY`는 반드시 Cloudflare Secret으로만 설정하며, `wrangler.toml`, 프런트엔드 코드, Git 저장소에 넣지 않습니다.
- `ALLOWED_ORIGIN`은 실제 정적 웹 앱의 출처만 허용합니다. 내부기관용 도메인을 별도로 운영하면 필요한 출처를 명시적으로 추가하고, 와일드카드를 사용하지 않습니다.
- 사용자 질문은 길이가 제한되며, AI·원천 API 오류는 SSE `error` 이벤트로 반환됩니다.
- Worker 로그와 CI 로그에 요청 전문이나 인증정보를 남기지 않습니다.
- 운영 전 의존성 취약점·정적 코드·비밀정보 유입 여부를 다시 점검합니다.
