# france-opendata Cloudflare Worker

MiniMax AI + data.gouv.fr tool-calling proxy for the GitHub Pages frontend.

## Architecture

```
GitHub Pages (React + Vite)
        │  POST /api/chat  { query }
        ▼
Cloudflare Worker  ──tool calls──▶  data.gouv.fr API
        │
        │  { message, toolCalls }
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

**Response:**
```json
{
  "message": { "role": "assistant", "content": "..." },
  "toolCalls": [
    { "name": "search_datasets", "arguments": { "query": "paris population" }, "result": "[...]" }
  ]
}
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
