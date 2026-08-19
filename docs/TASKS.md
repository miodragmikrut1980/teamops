# TeamOps AI — Task Board

> **AI agents: Read this file every session before writing any code.**
> Pick the next `[ ]` task in the active phase. Mark `[~]` when starting, `[x]` when done.
> Update this file as part of every PR or discovery session.

**Status:** `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` blocked
**Size:** S = ~1–2h · M = ~2–4h · L = ~4–8h
**Owner:** PM = Product Manager · FE = Frontend dev · BE = Backend dev

---

## ACTIVE — Phase 0: Discovery & Product Plan

**Goal:** Validate the problem and define exactly what to build before writing production code.
No dev tasks start until Phase 0 is complete.

See [docs/FOR_PRODUCT_MANAGER.md](FOR_PRODUCT_MANAGER.md) for how the PM uses AI for these tasks.

### Customer Discovery

- [ ] **P01** `PM · M` — Define and document the Ideal Customer Profile (ICP). Who exactly is the first customer? Company size, industry, current tools, decision maker, budget. Output: `docs/discovery/ICP.md`
- [ ] **P02** `PM · L` — Conduct 5 interviews with support managers. Document pain points, current workflow, tools used, biggest daily frustrations. Output: `docs/discovery/MANAGER_INTERVIEWS.md`
- [ ] **P03** `PM · M` — Conduct 5 interviews with support employees. Document how they experience scheduling, leave, workload visibility. Output: `docs/discovery/EMPLOYEE_INTERVIEWS.md`
- [ ] **P04** `PM · M` — Map the 5 data sources a typical manager opens every morning. Screenshot or describe each. Identify which data is most painful to combine. Output: `docs/discovery/DATA_SOURCES.md`

### Problem & Solution Validation

- [ ] **P05** `PM · M` — Write 20 real coverage scenarios (e.g. "Ana is sick, Tuesday afternoon, Linux/EMEA queue, 3 open P2s"). These become the test cases for the AI Coverage Engine. Output: `docs/discovery/COVERAGE_SCENARIOS.md`
- [ ] **P06** `PM · M` — Define the workload formula. What makes a ticket "heavy"? Priority, age, SLA proximity, escalation, complexity, required context. Output: `docs/discovery/WORKLOAD_FORMULA.md`
- [ ] **P07** `PM · M` — Define coverage rules. What is the minimum staff per queue/skill/hour for a typical pilot customer? Output: `docs/discovery/COVERAGE_RULES.md`
- [ ] **P08** `PM · L` — Build a clickable prototype of the Today Command Center. Figma or screenshot mockup. Test with 2–3 managers. Document reactions. Output: `docs/discovery/PROTOTYPE_FEEDBACK.md`

### Scope & Plan

- [ ] **P09** `PM · M` — Write final MVP scope. What is IN (must have for pilot). What is OUT (explicitly deferred). No ambiguity. Output: update `docs/PRODUCT_VISION.md` MVP section
- [ ] **P10** `PM · M` — Define pilot success metrics with numbers. Not "managers save time" — "managers spend ≤10 min on daily planning vs. current ~45 min". Output: update `docs/PROGRESS.md` pilot metrics section
- [ ] **P11** `PM · M` — Write user stories for the Today Command Center. Format: As a [role], I want [action] so that [outcome]. Cover manager and employee views. Output: `docs/discovery/USER_STORIES.md`
- [ ] **P12** `PM · S` — Identify first pilot customer. Name, contact, timeline, what they need to say yes. Output: `docs/discovery/PILOT_CUSTOMER.md`

---

## NEXT — Phase 1: Pilot MVP (starts after Phase 0 complete)

Dev tasks are ready but blocked until discovery validates what to build.
See full specs: [TODAY_COMMAND_CENTER.md](features/TODAY_COMMAND_CENTER.md) · [AI_COVERAGE_ENGINE.md](features/AI_COVERAGE_ENGINE.md)

### Foundation
- [ ] **T01** `BE · S` — Add `ticketSnapshots` table to DB schema
- [ ] **T02** `BE · S` — Add `coverageRequirements` table to DB schema

### CSV Import
- [ ] **T03** `BE · M` — API: `POST /api/import/tickets` (CSV upload and parse)
- [ ] **T04** `FE · M` — UI: CSV import panel component

### Today Command Center — API
- [ ] **T05** `BE · M` — `GET /api/today` — headcount section
- [ ] **T06** `BE · M` — `GET /api/today` — coverage timeline
- [ ] **T07** `BE · M` — `GET /api/today` — workload per person
- [ ] **T08** `BE · M` — `GET /api/today` — top 3 risks
- [ ] **T09** `BE · S` — `POST /api/today/accept-suggestion`

### Today Command Center — UI
- [ ] **T10** `FE · S` — `HeadcountSummary` component
- [ ] **T11** `FE · M` — `CoverageHeatmap` component
- [ ] **T12** `FE · S` — `WorkloadBar` component
- [ ] **T13** `FE · S` — `RiskList` component
- [ ] **T14** `FE · M` — `AiSuggestionCard` component
- [ ] **T15** `FE · M` — Wire up Today Command Center page

### AI Coverage Engine
- [ ] **T16** `BE · S` — `app/lib/coverage/types.ts`
- [ ] **T17** `BE · M` — Rule engine: hard constraint checking
- [ ] **T18** `BE · M` — Rule engine: candidate scoring
- [ ] **T19** `BE · M` — LLM explainer: prompt builder + OpenAI call
- [ ] **T20** `BE · S` — `POST /api/coverage/suggest`
- [ ] **T21** `BE · S` — `POST /api/coverage/apply`
- [ ] **T22** `BE · S` — Wire AI suggestions into `GET /api/today`

---

## Completed

*(Move finished tasks here with date and PR number)*
