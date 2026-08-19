# TeamOps AI — Task Board

> **AI agents: Check this file every session.**
> Pick the next `[ ]` task in the current sprint, mark it `[~]` when starting,
> `[x]` when done. Update this file as part of every PR.
> Mirror tasks exist as GitHub Issues — reference them in commit messages.

**Status key:** `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` blocked
**Size key:** S = ~1–2h · M = ~2–4h · L = ~4–8h (one AI session each)

---

## Current Sprint — Phase 1, Sprint 1
**Goal:** Today Command Center + CSV import for pilot data

---

### Foundation

| # | Task | Size | Layer | Issue |
|---|---|---|---|---|
| T01 | Add `ticketSnapshots` table to DB schema | S | backend | #1 |
| T02 | Add `coverageRequirements` table (min staff per queue/hour) | S | backend | #2 |

- [ ] **T01** — Add `ticketSnapshots` table to `db/schema.ts`. Fields: `id`, `organizationId`, `assigneeUserId`, `externalId`, `status` (open/closed), `priority` (p1/p2/p3), `ageHours`, `slaDeadline`, `queueId`, `workloadScore`, `importedAt`. Run `drizzle-kit generate`. See [AI_COVERAGE_ENGINE.md](features/AI_COVERAGE_ENGINE.md).
- [ ] **T02** — Add `coverageRequirements` table. Fields: `id`, `organizationId`, `queueId`, `dayOfWeek` (0–6), `hourStart` (8–18), `minimumStaff`, `requiredSkillId`. This drives the coverage gap calculation.

---

### CSV Import

| # | Task | Size | Layer | Issue |
|---|---|---|---|---|
| T03 | API: `POST /api/import/tickets` — CSV upload and parse | M | backend | #3 |
| T04 | UI: CSV import component with file picker and validation feedback | M | frontend | #4 |

- [ ] **T03** — Create `app/api/import/tickets/route.ts`. Accept multipart form with CSV file. Parse rows (columns: `id,assignee_email,status,priority,age_hours,sla_deadline,queue_name`). Map `assignee_email` to `userId` via `users` table. Bulk insert into `ticketSnapshots`. Return `{ imported: number, errors: string[] }`. Requires `schedule:write` permission. Write audit event `tickets.imported`.
- [ ] **T04** — Create `app/components/import/CsvImportPanel.tsx`. File picker, column mapping preview, import button, result summary (imported / errors). Call `POST /api/import/tickets`. Show last import timestamp.

---

### Today Command Center — API

| # | Task | Size | Layer | Issue |
|---|---|---|---|---|
| T05 | API: `GET /api/today` — headcount section | M | backend | #5 |
| T06 | API: `GET /api/today` — coverage timeline | M | backend | #6 |
| T07 | API: `GET /api/today` — workload per person | M | backend | #7 |
| T08 | API: `GET /api/today` — top 3 risks | M | backend | #8 |
| T09 | API: `POST /api/today/accept-suggestion` | S | backend | #9 |

- [ ] **T05** — Create `app/api/today/route.ts`. Headcount section: query shifts for today → count planned. Subtract users with approved leave today → get available. Requires `schedule:read:any` permission. Full response shape in [TODAY_COMMAND_CENTER.md](features/TODAY_COMMAND_CENTER.md).
- [ ] **T06** — Coverage timeline: for each hour 08–18, count staff in shift minus absent. Compare to `coverageRequirements`. Return `byHour` and `byQueue` arrays. Color threshold: gap ≤ -1 = red, gap = 0 = yellow, gap > 0 = green.
- [ ] **T07** — Workload per person: join shifts (today, active) with `ticketSnapshots` grouped by `assigneeUserId`. Calculate `workloadScore`. Flag `hasActiveEscalation`, `hasSlaRiskTicket`, `shiftEnd` (for "leaving soon" flag). Graceful: if no ticket data, return `workloadScore: null`.
- [ ] **T08** — Risks: identify top 3 problems from coverage gaps + SLA risk tickets + escalations without owner update. Return plain-language `description` for each. No LLM needed — rule-based text generation.
- [ ] **T09** — Create `app/api/today/accept-suggestion/route.ts`. `POST` with `{ suggestionRank: number }`. Read suggestion from session/cache (or regenerate). Create shift assignments. Write audit event `coverage.suggestion_accepted`. Requires `schedule:publish`.

---

### Today Command Center — UI

| # | Task | Size | Layer | Issue |
|---|---|---|---|---|
| T10 | UI: `HeadcountSummary` component | S | frontend | #10 |
| T11 | UI: `CoverageHeatmap` component | M | frontend | #11 |
| T12 | UI: `WorkloadBar` component | S | frontend | #12 |
| T13 | UI: `RiskList` component | S | frontend | #13 |
| T14 | UI: `AiSuggestionCard` component | M | frontend | #14 |
| T15 | UI: Wire up Today Command Center page | M | frontend | #15 |

- [ ] **T10** — `app/components/today/HeadcountSummary.tsx`. Three stat cards: Planned / Available / Absent. Show absent users as a small list with name and reason. Props: `{ planned, available, absent, absentUsers }`.
- [ ] **T11** — `app/components/today/CoverageHeatmap.tsx`. Grid: rows = queues, columns = hours. Each cell colored by gap severity (green/yellow/red). Tooltip on hover: `staffed X / need Y`. Props: `{ coverage: CoverageData }`.
- [ ] **T12** — `app/components/today/WorkloadBar.tsx`. Per-person row: name, shift time, visual bar (0–100 workload score), flag icons (escalation, SLA risk, leaving soon). Props: `{ workload: WorkloadEntry[] }`.
- [ ] **T13** — `app/components/today/RiskList.tsx`. Numbered list of 1–3 risks. Each has severity badge (high/medium), description text, and time range if applicable. Props: `{ risks: Risk[] }`.
- [ ] **T14** — `app/components/today/AiSuggestionCard.tsx`. One suggestion card: rank badge, confidence %, summary line, expandable full explanation, "why not others" section, action buttons (Accept / Modify). Props: `{ suggestion: AiSuggestion; onAccept: () => void }`.
- [ ] **T15** — Wire up `app/page.tsx` or `app/dashboard-client.tsx` to show Today Command Center as the default manager view. Fetch `GET /api/today`. Compose all components. Empty states for: no shifts, no tickets, no AI suggestions. Mobile responsive.

---

### AI Coverage Engine

| # | Task | Size | Layer | Issue |
|---|---|---|---|---|
| T16 | Lib: `coverage/types.ts` — shared TypeScript types | S | backend | #16 |
| T17 | Lib: `coverage/rule-engine.ts` — hard constraint check | M | backend | #17 |
| T18 | Lib: `coverage/rule-engine.ts` — candidate scoring | M | backend | #18 |
| T19 | Lib: `coverage/llm-explainer.ts` — prompt + OpenAI call | M | backend | #19 |
| T20 | API: `POST /api/coverage/suggest` | S | backend | #20 |
| T21 | API: `POST /api/coverage/apply` | S | backend | #21 |
| T22 | Wire AI suggestions into `GET /api/today` | S | backend | #22 |

- [ ] **T16** — Create `app/lib/coverage/types.ts`. Export: `CoverageRequest`, `CandidateScore`, `CoverageSuggestion`, `HardConstraintViolation`. Full shapes in [AI_COVERAGE_ENGINE.md](features/AI_COVERAGE_ENGINE.md).
- [ ] **T17** — `app/lib/coverage/rule-engine.ts` — `checkHardConstraints(userId, gap, db)`. Returns list of violated constraints or empty array if candidate is eligible. Checks: availability, leave, skills, shift conflict, hours limit.
- [ ] **T18** — `rule-engine.ts` — `scoreCandidates(eligibleUsers, gap, db)`. Scores each candidate on: workload balance, skill match, fairness (extra shifts this week), continuity (worked this queue before), shift time remaining. Returns sorted `CandidateScore[]`.
- [ ] **T19** — `app/lib/coverage/llm-explainer.ts`. Build structured prompt from ranked candidates + disqualified list. Call OpenAI API (`gpt-4o` or `gpt-4o-mini`). Parse response into `CoverageSuggestion[]`. Full prompt structure in [AI_COVERAGE_ENGINE.md](features/AI_COVERAGE_ENGINE.md).
- [ ] **T20** — `app/api/coverage/suggest/route.ts`. `POST` — validate request, call rule engine + LLM explainer, log `coverage.suggestion_generated` audit event, return suggestions. Requires `schedule:write`.
- [ ] **T21** — `app/api/coverage/apply/route.ts`. `POST` — create shift assignments from accepted suggestion, write `coverage.suggestion_accepted` audit event. Requires `schedule:publish`.
- [ ] **T22** — Update `GET /api/today` to call `POST /api/coverage/suggest` internally for the top gap and include suggestions in the response. Cache result for 5 minutes (avoid re-calling LLM on every page refresh).

---

## Backlog (Phase 1, Sprint 2)

- [ ] Basic forecast: inbound volume by hour from ticket import history
- [ ] What-if simulation: remove a person and recalculate coverage
- [ ] Employee today view: my shift, my queue, my tickets, my on-call
- [ ] In-app notifications for managers when suggestions are ready
- [ ] Coverage requirements setup UI (min staff per queue/hour)

---

## Completed

*(Move tasks here when done, with date)*

---

## How to Update This File

When starting a task:
```
- [~] **T05** — ...
```

When done (include PR number):
```
- [x] **T05** — ... (PR #42)
```

When blocked:
```
- [-] **T05** — BLOCKED: needs T02 first
```
