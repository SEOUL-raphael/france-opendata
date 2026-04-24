# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a French public data portal explorer web app for Korean policy makers benchmarking against data.gouv.fr.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Routing**: wouter
- **AI**: Minimax MiniMax-M1 with 1 reasoning loop

## Artifacts

### `artifacts/france-opendata` — Main Web App (/)
Korean-language web app for South Korean policy makers to explore France's public data portal (data.gouv.fr) as a benchmark reference. Features:
- Dataset search powered by data.gouv.fr REST API (direct frontend calls, CORS-enabled)
- Organization browser
- API service (dataservice) explorer
- Dataset detail view with resource listings
- About page: French open data portal background/philosophy in Korean (탄생 배경, Etalab, 철학, 한국 비교)
- Minimax AI chat (floating panel) — uses MiniMax-M1 with 1 reasoning loop for Korean policy analysis

### `artifacts/api-server` — Express API Server (/api)
Handles AI chat route only; data.gouv.fr is called directly from the frontend.
- `POST /api/chat/message` — Minimax MiniMax-M1 AI chat with thinking/reasoning support (MINIMAX_API_KEY required)
- `GET /api/healthz` — Health check

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables Required

- `MINIMAX_API_KEY` — Minimax API key for AI chat functionality

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
