# TeamOps AI — Progress & Next Steps

> **AI agents: Read this file every session before writing any code.**
> It tells you what is done, what is in progress, and what to work on next.
> Update this file whenever a feature is completed or a decision is made.

---

## Current Phase: Phase 0 — Discovery

**Goal:** Validate with real support managers that the Today Command Center
delivers value before investing in full integrations.

**Strategy:** Build shadow mode — AI runs recommendations alongside the manager's
manual process. Measure time saved, coverage gaps, SLA risk improvement, and
AI suggestion acceptance rate.

---

## What Is Built (v0.4.0)

| Feature | Status | Notes |
|---|---|---|
| Multi-tenant organizations | Done | Workspace isolation via SIWC headers |
| Sign in with ChatGPT (SIWC) | Done | Auth via OpenAI workspace headers |
| RBAC (manager / employee / auditor) | Done | `app/lib/authorization.ts` |
| Bootstrap / org creation | Done | `app/api/bootstrap/` |
| Team management | Done | Teams, members, invitations (7-day expiry) |
| Skills matrix | Done | Skills, proficiency 1–5, certifications |
| Weekly scheduling (ROTA) | Done | Draft → Published → Superseded states |
| Shift management | Done | Regular, on-call, training shift types |
| Schedule acknowledgement | Done | Employees confirm published schedules |
| Availability tracking | Done | Per-user, per-day: available/unavailable/preferred |
| Leave requests | Done | Request, approve, reject, cancel workflow |
| Audit log | Done | Full event trail with actor, action, metadata |
| Configuration versioning | Done | Org config with team profile templates |

---

## In Progress

*Nothing currently in progress. Ready to start Phase 1 features.*

---

## Next — Phase 1 Priority Order

**See [TASKS.md](TASKS.md) for the granular task breakdown of everything below.**

### 1. Today Command Center (P0 — build this first)
The flagship screen. Manager sees today's state in 30 seconds.
**Spec:** [docs/features/TODAY_COMMAND_CENTER.md](features/TODAY_COMMAND_CENTER.md)

### 2. CSV/Excel Import (P0 — needed for pilot data)
Universal fallback for ticket data, CSAT, employee lists, absences.
No real integrations needed for pilot — CSV covers it.

### 3. Ticket Workload View (P1 — depends on CSV import)
Weighted workload score per person. Not just ticket count.
**Spec:** [docs/features/TICKET_WORKLOAD.md](features/TICKET_WORKLOAD.md) *(to be written)*

### 4. AI Coverage Engine v1 (P0 — core value proposition)
Explainable coverage recommendations for Today Command Center.
Phase 1: LLM-based with rule engine. Phase 2: OR-Tools constraint solver.
**Spec:** [docs/features/AI_COVERAGE_ENGINE.md](features/AI_COVERAGE_ENGINE.md)

### 5. Coverage Gap Detection (P1 — needed for Command Center)
Identify time intervals where coverage falls below minimum per queue/skill.

### 6. Basic Forecast (P1)
Inbound volume by hour/day based on historical CSV data.
Needed to make coverage gap detection useful.

---

## Blocked / Deferred

| Feature | Blocked by | Notes |
|---|---|---|
| Jira / Zendesk integration | Phase 2 | CSV import covers pilot |
| OR-Tools optimization | Phase 2 | LLM-based rules cover Phase 1 |
| Real-time Slack/Teams notifications | Phase 2 | Email/in-app first |
| Escalation management | Phase 2 | Needs ticket integration |
| Performance & Quality module | Phase 2 | Needs CSAT data pipeline |
| Mobile native app | Phase 3 | PWA is sufficient for pilot |
| SSO/SAML, SCIM | Phase 2 | Needed for enterprise sales |

---

## Architecture Decisions (made)

| Decision | Choice | Reason |
|---|---|---|
| Frontend | Keep Next.js + Cloudflare Workers | Already built, working |
| Database | D1 now → Neon PostgreSQL migration | D1 won't scale for analytics/forecasting |
| ORM | Drizzle (stays) | Supports both D1 and Neon |
| Optimization engine | OR-Tools (Phase 2) | Not needed for Phase 1 LLM approach |
| Optimization service | Python microservice on Fly.io | Phase 2, separate from main app |
| Auth | SIWC (stays) | OpenAI platform advantage |

---

## Pilot Success Metrics (Phase 1 targets)

These are hypotheses to validate — not commitments to customers:
- 60%+ less time spent on daily planning and coverage checks
- 30%+ fewer uncovered time intervals
- 15–25% fewer tickets entering SLA risk
- 10–20% fewer manual schedule changes after publishing
- 70%+ of AI suggestions accepted or accepted with minor modification
- 80%+ of managers and employees rate explanations as clear and fair
