---
name: External deploy topology
description: GitHub Pages + Cloudflare Worker deployment for france-opendata; redeploy steps and env vars.
---

# External deploy topology (france-opendata)

- Frontend: https://seoul-raphael.github.io/france-opendata/ — deployed by `.github/workflows/pages.yml` (the frontend folder's direct npm install/build; triggers on push to `artifacts/france-opendata/**`, or manual `workflow_dispatch`). GitHub repo: `SEOUL-raphael/france-opendata` (origin remote, token in Replit secret `GITHUB_TOKEN`).
- Worker: https://france-opendata-worker.neoulneoul.workers.dev — deploy with `cd cloudflare-worker && npx wrangler deploy` (auth via Replit secret `CLOUDFLARE_API_TOKEN`; MiniMax key stored as Worker secret `MINIMAX_API_KEY`).
- GitHub Actions repo variables: `VITE_WORKER_URL` (Worker URL) and `VITE_GITHUB_PAGES_BASE=/france-opendata/` — baked into the Vite build; changing either requires re-running the Pages workflow.
- Frontend is standalone: GitHub Pages calls only the Worker (`/api/chat`, `/api/health`) through `VITE_WORKER_URL`; it has no Replit API, WebSocket, plugin, or workspace-package dependency. When the environment variable is absent in Replit, it intentionally shows a migration notice rather than the app.
- An Internal-visibility GitLab mirror is maintained for government-internal reference. Its remote URL must not contain credentials; use `GIT_ASKPASS` with the `GITLAB_TOKEN` Replit secret for pushes.
- The Internal GitLab remote enforces OSV and Trivy pre-receive scans across the full repository. Existing vulnerable dependencies can block otherwise unrelated pushes; do not bypass the hook—remediation needs separately approved dependency work.

**Why:** the public service must remain deployable without Replit infrastructure, while the Replit artifact is retained only to direct legacy visitors to the new site.
**How to apply:** public frontend requests must target the Cloudflare Worker directly; after Worker changes redeploy with wrangler, after frontend changes push to GitHub main. For the internal mirror, keep GitLab project visibility as Internal and do not persist access tokens in `.git/config`, shell history, or documentation.
