# TeamOps AI — Product Vision

## What We're Building

**Category:** Support Workforce Intelligence / Support Operations Management
*(Not HR software. Not generic WFM. Not a contact-center scheduling tool.)*

**One-line pitch:**
"AI operations center for support teams — knows who works, what they can do,
how loaded they are, and who should cover every shift, queue, or escalation."

**Core promise:**
A support manager opens TeamOps AI and in 30 seconds has:
- Who is working today and in what shift
- Where coverage gaps will appear and when
- Who can cover each gap (with explanation, not just a name)
- Current SLA risk, backlog, and active escalations
- 2–3 ranked, explainable AI coverage suggestions — ready to approve or modify

---

## The Problem We Solve

Support managers today manually combine data from: shift calendar, leave tracker,
ticketing system, escalation queue, CSAT reports, and skill spreadsheets.
This takes 30–60 minutes every morning and requires constant re-checking throughout the day.

Questions a manager answers manually right now:
- Who is working today and in which shift?
- Who is on leave, sick, in training, or leaving early?
- Who can cover a gap in skills, language, timezone, or seniority?
- Do we have enough people per queue, product, or hour?
- Who has the highest backlog or the oldest tickets?
- When do new tickets typically arrive? When do escalations spike?
- Who closes tickets fast but has poor CSAT or high reopen rate?
- Who can take a critical escalation without dropping their current work?
- Is the distribution of nights, weekends, and on-call fair?
- What happens if one more person is absent?

TeamOps AI answers all of these in one place.

---

## Target Customer

**Ideal first customers:** Support organizations of 20–200 people that:
- Run technical / IT / B2B support (not high-volume consumer call centers)
- Already feel the scheduling + coverage pain daily
- Can move fast on a pilot without long procurement cycles

**Out of scope for now:** Large enterprise contact centers, consumer call centers,
field service, healthcare, general HR use cases.

---

## Two User Roles (MVP)

### Manager
Full operational view: ROTA, absences, coverage, backlog, escalations, CSAT,
AI coverage suggestions, approvals, audit log, team configuration.

### Employee
Personal view: my shifts, my on-call, my queue, my backlog, my stats.
Actions: request leave, offer/swap shift, confirm schedule, report overload.

*(RBAC is granular internally from day one. Team Lead, Scheduler/WFM, HR read-only,
Executive, and Auditor roles are added in Phase 2.)*

---

## The Flagship Screen: Today Command Center

The most valuable screen. Manager sees in 30 seconds:
- Headcount: planned / available / absent
- Coverage by hour (heatmap — green/yellow/red)
- Under-covered queues and skills
- Active ticket counts: open, in SLA risk, escalated
- Active P1/P2 escalations
- Current workload per team member
- Top 3 risks for today
- AI Coverage Plan with 2–3 suggestions
- Action buttons: Accept / Modify / Simulate / Notify team

Example AI message:
> "14:00–17:00 Linux/EMEA queue has an estimated shortage of 1.4 FTE.
> Ana leaves at 14:00, Marko is on leave, and Tuesday inbound volume
> historically rises 31%. Suggestion A: Jelena covers 14:00–16:00, Petar 16:00–17:00.
> Jelena has the required Linux skill, 23% lower active backlog than the team average,
> and has not covered extra shifts this week. Confidence: 86%."

Every suggestion must also show: reasons against (active P1, upcoming training,
too many night shifts this week), alternatives, and what risk remains.

---

## AI Coverage Engine (Core of the Product)

**Rule:** LLM does NOT calculate the schedule. A constraint/optimization engine
(OR-Tools in Phase 2) does the hard constraints and ranking. The LLM explains
results and powers the conversational interface.

### Hard constraints (never broken)
- Person is unavailable
- Person lacks required skill or certification
- Would violate maximum hours or mandatory rest
- Time conflict with another assignment
- Legal/policy prohibition
- Already on a critical incident or exclusive task

### Soft constraints (optimized)
- Better coverage of forecasted inbound volume
- Lower backlog and SLA risk
- Fair distribution of nights, weekends, on-call
- Minimum overtime
- Employee preferences (where firm allows)
- Continuity on ongoing cases

### Every recommendation must include
- Who is suggested and for what exactly
- Why this person (skills, availability, workload, fairness)
- Why others were NOT chosen
- What risk remains
- Confidence score
- Missing data that would improve the recommendation
- Human approval required before publishing

---

## Key Modules

| Module | Priority | Phase |
|---|---|---|
| Today Command Center | P0 | Phase 1 |
| ROTA / Weekly Schedule | P0 (built) | Done |
| Absences + coverage impact | P0 (built) | Done |
| Skills matrix | P0 (built) | Done |
| AI Coverage Engine | P0 | Phase 1 |
| Ticket workload (CSV import first) | P1 | Phase 1 |
| Forecasting (basic) | P1 | Phase 1 |
| Escalation management | P2 | Phase 2 |
| Performance & Quality | P2 | Phase 2 |
| Real-time integrations (Jira, Zendesk) | P2 | Phase 2 |
| No-code rule builder | P2 | Phase 2 |
| Advanced forecasting + scenario planning | P3 | Phase 3 |

---

## Integration Priority

1. CSV/Excel import — build first, universal fallback for pilot
2. Jira Service Management
3. ServiceNow
4. Zendesk
5. Microsoft Teams + Outlook
6. Slack + Google Calendar

---

## Competitive Position

| Competitor | Strength | Our edge |
|---|---|---|
| Assembled | Strong AI WFM for support/contact-center | Technical support focus, explainability, fairness |
| Zendesk WFM | Native Zendesk integration | Vendor-neutral, multi-tool |
| Playvox | WFM + quality management | Better coverage intelligence |
| NICE / Verint | Powerful for large contact centers | Lighter, faster, designed for 20–200 person teams |

**Our defensible difference:**
1. Technical support and ticket operations focus (not just contact-center headcount)
2. Unique combination: ROTA + absences + backlog + skills + escalations + CSAT/QA
3. Explainable suggestions with alternatives and trade-off view
4. Configuration-first, adaptable to each company without custom code
5. Vendor-neutral (connects multiple ticketing, HR, calendar systems)
6. Shadow mode for safe rollout and ROI measurement
7. Fairness and employee trust as product features, not footnotes

---

## Business Model

B2B SaaS per active employee/month:
- **Pilot:** Fixed implementation fee, limited users
- **Team:** Schedule, absence, workload, coverage basics
- **Pro:** Forecasting, AI recommendations, escalations, advanced analytics
- **Enterprise:** SSO/SCIM, audit, data residency, custom SLAs, premium connectors

Target first commercial customers: support orgs of 20–200 people that can approve
a pilot quickly. IBM-scale deals come later.

---

## What We Will Never Build (in this product)

- Fully autonomous scheduling without human approval
- Payroll or HRIS
- Employee performance rankings visible to peers
- Keyboard/screen/activity monitoring
- Automatic disciplinary actions based on AI output
- Generic project management

---

## Fairness and Privacy Principles

- Employees see their own data and can flag errors
- No hidden tracking
- No public leaderboards or peer rankings
- AI does not make final decisions on leave, evaluation, or discipline
- Fairness constraints prevent always picking the same "best" person
- GDPR DPIA required before commercial launch
- EU AI Act assessment before using AI output in any HR decision
- Tenant data is never used to train shared models without explicit agreement
