---
name: External deploy topology
description: GitHub Pages + Cloudflare Worker deployment for france-opendata; redeploy steps and env vars.
---

# External deploy topology (france-opendata)

- Frontend: https://seoul-raphael.github.io/france-opendata/ — deployed by root `.github/workflows/pages.yml` (pnpm build, triggers on push to `artifacts/france-opendata/**`, or manual `workflow_dispatch`). GitHub repo: `SEOUL-raphael/france-opendata` (origin remote, token in Replit secret `GITHUB_TOKEN`).
- Worker: https://france-opendata-worker.neoulneoul.workers.dev — deploy with `cd cloudflare-worker && npx wrangler deploy` (auth via Replit secret `CLOUDFLARE_API_TOKEN`; MiniMax key stored as Worker secret `MINIMAX_API_KEY`).
- GitHub Actions repo variables: `VITE_WORKER_URL` (Worker URL) and `VITE_GITHUB_PAGES_BASE=/france-opendata/` — baked into the Vite build; changing either requires re-running the Pages workflow.
- Frontend is dual-mode: `VITE_WORKER_URL` set → fetch Worker (`/api/chat`, `/api/health`); unset (Replit dev) → WebSocket `/api/ws/search` against the Express api-server.

**Why:** the user runs the app both on Replit (dev) and standalone (GitHub Pages); all GitHub Pages-only fixes must keep the Replit WebSocket path untouched.
**How to apply:** any endpoint the frontend calls must exist in BOTH the Express api-server and the Worker (or be gated on `USE_WORKER`); after Worker changes redeploy with wrangler, after frontend changes push to GitHub main.
