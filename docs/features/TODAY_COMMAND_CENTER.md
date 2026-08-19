# Feature Spec: Today Command Center

**Priority:** P0 — Build this first
**Phase:** Phase 1
**Status:** Not started

---

## What It Is

The flagship screen of TeamOps AI. A manager opens it and in 30 seconds knows:
- Who is working today and in which shift
- Where coverage gaps will appear
- Current ticket load, SLA risk, and escalations
- 2–3 AI coverage suggestions, ready to act on

This screen replaces the morning ritual of opening 5–7 different tools.

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Today — Tuesday, 19 Aug 2026   [Team ▼]   [Simulate] [⚙]  │
├───────────────┬─────────────────────────────────────────────┤
│  HEADCOUNT    │  COVERAGE TIMELINE (hourly heatmap)         │
│  18 planned   │  08 09 10 11 12 13 14 15 16 17 18           │
│  16 available │  ██ ██ ██ ██ ░░ ░░ ▒▒ ▒▒ ██ ██ ██           │
│   2 absent    │  Linux/EMEA: ██ ██ ██ ██ ██ ██ ░░ ░░ -- --  │
│               │  EN/Tier2:  ██ ██ ██ ██ ░░ ░░ ░░ -- -- --   │
├───────────────┼─────────────────────────────────────────────┤
│  TICKETS      │  WORKLOAD PER PERSON                        │
│  142 open     │  Ana K.    ████████░░  8 tickets  ← leaving │
│   23 SLA risk │  Marko P.  ░░░░░░░░░░  on leave             │
│    4 escalated│  Jelena M. █████░░░░░  5 tickets            │
│               │  Petar S.  ██████░░░░  6 tickets            │
├───────────────┴─────────────────────────────────────────────┤
│  TOP RISKS TODAY                                             │
│  ⚠ Linux/EMEA 14:00–17:00 — gap of 1.4 FTE (Ana leaves)   │
│  ⚠ 3 tickets crossing SLA deadline by 16:00                │
│  ⚠ 2 escalations without owner update > 4h                  │
├─────────────────────────────────────────────────────────────┤
│  AI COVERAGE PLAN                                            │
│  Suggestion A (86% confidence): Jelena 14–16h, Petar 16–17h│
│  Suggestion B (71%): Move Darko from EN queue 14–17h        │
│  [Accept Plan A] [Modify] [Simulate Scenario] [Notify Team] │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Shown

### Headcount Summary
- Planned headcount for today (scheduled)
- Available now (scheduled and not absent)
- Absent count (approved leave + reported sick today)

### Coverage Timeline (heatmap)
- X axis: hours of the working day
- Y axis: teams or queues (configurable)
- Color: green = full coverage, yellow = partial, red = gap
- Calculated from: shifts present today minus absences

### Ticket Snapshot
- Open tickets (from last import or integration)
- Tickets entering SLA risk in next 4 hours
- Active escalations (P1/P2)

### Workload Per Person
- Each person currently on shift
- Visual bar: active tickets weighted by priority and age
- Flag if person is leaving soon, has critical SLA ticket, or is on an escalation

### Top 3 Risks
- Plain language description of the most important problems today
- Calculated by the coverage + SLA + escalation engine
- Maximum 3 items so manager focuses attention

### AI Coverage Plan
- 2–3 ranked suggestions from the AI Coverage Engine
- Each shows: who, what they cover, why chosen, confidence %
- One-click accept or open for modification

---

## API Routes Needed

### `GET /api/today`
Returns all data for the Today Command Center in one call.

**Response shape:**
```typescript
{
  date: string;                    // "2026-08-19"
  headcount: {
    planned: number;
    available: number;
    absent: number;
    absentUsers: { userId: string; name: string; reason: string }[];
  };
  coverage: {
    byHour: {
      hour: number;                // 8, 9, 10, ... 18
      staffed: number;             // people available this hour
      required: number;            // minimum required (from org config)
      gap: number;                 // negative = gap, positive = surplus
    }[];
    byQueue: {
      queueId: string;
      queueName: string;
      byHour: { hour: number; staffed: number; required: number; gap: number }[];
    }[];
  };
  tickets: {
    open: number;
    slaRisk: number;              // entering risk in next 4 hours
    escalated: number;
    lastImportedAt: string | null;
  };
  workload: {
    userId: string;
    name: string;
    shiftEnd: string;             // ISO time — flag if leaving soon
    activeTickets: number;
    workloadScore: number;        // 0–100 weighted score
    hasActiveEscalation: boolean;
    hasSlaRiskTicket: boolean;
  }[];
  risks: {
    severity: "high" | "medium";
    description: string;
    affectedFrom: string | null;  // ISO datetime
    affectedUntil: string | null;
  }[];
  aiSuggestions: {
    rank: number;                 // 1, 2, 3
    confidence: number;           // 0–100
    summary: string;              // one sentence
    explanation: string;          // full explanation with why/why not
    actions: {
      userId: string;
      userName: string;
      coverFrom: string;
      coverUntil: string;
      queueId?: string;
    }[];
  }[];
}
```

### `POST /api/today/accept-suggestion`
Manager accepts an AI suggestion. Creates the shifts/assignments and audit event.

```typescript
// Request
{ suggestionRank: number }

// Response
{ status: "accepted"; shiftsCreated: number }
```

### `POST /api/today/notify-team`
Sends in-app notifications to affected team members about today's coverage plan.

---

## DB Queries Needed

### Coverage calculation
```sql
-- People working today = shifts that overlap with today
SELECT userId, shiftStart, shiftEnd
FROM shifts
WHERE organizationId = ?
  AND date(shiftStart) = date('now')
  AND status = 'published'

-- Subtract people on leave
SELECT userId FROM leaveRequests
WHERE organizationId = ?
  AND startDate <= date('now')
  AND endDate >= date('now')
  AND status = 'approved'
```

### Workload per person (Phase 1 — from CSV import table)
```sql
SELECT assigneeUserId, COUNT(*) as ticketCount,
       SUM(workloadScore) as totalScore
FROM ticketSnapshots
WHERE organizationId = ?
  AND status = 'open'
GROUP BY assigneeUserId
```

---

## Components to Build

```
app/
  dashboard-client.tsx           ← already exists, add Command Center section
  components/
    today/
      HeadcountSummary.tsx       ← planned / available / absent cards
      CoverageHeatmap.tsx        ← hourly grid, color-coded by gap severity
      WorkloadBar.tsx            ← per-person bar with flags
      RiskList.tsx               ← top 3 risks, plain language
      AiSuggestionCard.tsx       ← one suggestion with accept/modify buttons
      AiCoveragePlan.tsx         ← container for all suggestions
```

---

## Implementation Notes

- Phase 1: AI suggestions are LLM-generated (OpenAI API call with structured context)
- Phase 2: Replace with OR-Tools constraint solver, LLM explains the output
- Coverage heatmap color thresholds: `gap <= -1 → red`, `gap === 0 → yellow`, `gap > 0 → green`
- Workload score formula (Phase 1): `open tickets × priority weight + SLA risk bonus + escalation bonus`
- If ticket data is missing (no import yet), show the section with a prompt to import data
- The `[Simulate]` button opens the what-if scenario panel (build after core screen works)
- Human must click Accept — never auto-apply suggestions

---

## Definition of Done

- [ ] `/api/today` returns correct data for a manager's org
- [ ] Coverage heatmap renders and color-codes correctly
- [ ] Workload bar shows per-person state with flags
- [ ] Top 3 risks are listed in plain language
- [ ] At least 2 AI suggestions are shown with full explanation
- [ ] Accept button creates the shift/assignment and audit event
- [ ] Screen works on mobile (responsive)
- [ ] Empty state handled: no shifts, no tickets, no suggestions each shown clearly
- [ ] Permission check: only managers see AI suggestions and Accept button
