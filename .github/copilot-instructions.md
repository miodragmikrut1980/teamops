# GitHub Copilot Instructions — TeamOps AI

## Project

TeamOps AI is a B2B SaaS platform for Support Workforce Intelligence.
It helps support managers see who's working, who can cover gaps, SLA risks,
backlog, and escalations — all in one place with explainable AI recommendations.

Phase 0 (Discovery). Foundation built at v0.4.0. Team: 3 people (Product/CEO, Frontend, Backend).

## Stack

- Next.js 16.2.6, React 19.2.6, TypeScript 5.9.3 (strict)
- Cloudflare Workers via vinext 0.0.50
- Database: Cloudflare D1 (SQLite) → migrating to Neon (PostgreSQL)
- Drizzle ORM 0.45.2
- Tailwind CSS 4.2.1
- Auth: Sign in with ChatGPT (SIWC) via OpenAI workspace headers

## Code Rules

- TypeScript strict — no `any`, no untyped assertions
- Named exports only (except Next.js page files)
- Drizzle ORM for all DB access — no raw SQL
- Every DB query touching user/team/schedule data must filter by `organizationId`
- Validate inputs at API boundaries (server-side)
- Return `{ error: string, code: string }` on API failures
- Tailwind CSS only — no inline styles
- Write to audit log for every manager action on schedules or approvals
- No `console.log` in production paths

## Folder Layout

- `app/` — Next.js pages, API routes, components
- `app/api/` — API handlers (bootstrap, team-setup, schedule, leave-requests, me)
- `app/lib/` — auth, tenant context, authorization helpers
- `db/schema.ts` — all Drizzle table definitions (single source of truth)
- `drizzle/` — generated migrations (never edit manually)
- `worker/` — Cloudflare Worker entry point
- `tests/` — Node.js native test runner

## Hard Rules

- AI output must never affect schedules without explicit human approval
- Never bypass tenant isolation — all queries must be org-scoped
- Keep SQL compatible with PostgreSQL (Neon migration is planned)
- No payroll, HRIS, or general project management scope
- No public employee performance leaderboards
