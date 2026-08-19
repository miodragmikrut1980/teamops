# Feature Spec: AI Coverage Engine

**Priority:** P0 — Core value proposition
**Phase:** Phase 1 (LLM-based) → Phase 2 (constraint solver)
**Status:** Not started
**Depends on:** Today Command Center data pipeline

---

## What It Does

The AI Coverage Engine answers: "Who should cover this gap, and why?"

It takes the current operational state (shifts, absences, skills, workload, constraints)
and returns ranked, explainable coverage suggestions with confidence scores.

**Rule:** The LLM never calculates the schedule. A rule engine does constraint
checking and ranking. The LLM explains results in plain language.

---

## Two Implementation Phases

### Phase 1 (Build now): Rule Engine + LLM Explanation

1. A TypeScript rule engine evaluates hard constraints and scores candidates
2. Ranked candidates are passed to an LLM (OpenAI API)
3. LLM writes the explanation in plain language
4. Result returned to Today Command Center

### Phase 2 (Later): OR-Tools Constraint Solver + LLM Explanation

1. OR-Tools (Python microservice on Fly.io) solves the full optimization problem
2. LLM explains the solution and powers the conversational interface
3. Rule engine from Phase 1 is replaced but explanation layer stays the same

---

## Inputs to the Engine

```typescript
type CoverageRequest = {
  organizationId: string;
  gapStart: string;          // ISO datetime
  gapEnd: string;
  requiredSkills: string[];  // skill IDs
  queueId?: string;
  minimumStaff: number;
  context: {
    date: string;
    timezone: string;
  };
};
```

Data the engine reads from DB for each candidate:
- Is the person available during the gap? (shift status, leave, availability table)
- Do they have the required skills? (userSkills table, proficiency level)
- What is their current workload score?
- Do they have an active escalation?
- How many extra shifts have they worked this week?
- How many nights/weekends have they covered this month?
- Is their shift ending soon (< 1 hour)?
- Are there any conflicting assignments?

---

## Hard Constraints (eliminate candidates — never suggest if violated)

```typescript
const hardConstraints = [
  "person_unavailable",        // on approved leave, not in a shift, or marked unavailable
  "missing_required_skill",    // lacks a skill or certification flagged as required
  "shift_conflict",            // already assigned to another exclusive task
  "max_hours_exceeded",        // would exceed weekly hour limit
  "mandatory_rest_violated",   // insufficient rest between shifts (legal)
  "on_critical_incident",      // currently handling a P1 with exclusive assignment
  "legal_policy_block",        // any org-defined hard rule (configurable per tenant)
];
```

---

## Soft Constraints (score candidates — optimize)

```typescript
type CandidateScore = {
  userId: string;
  scores: {
    workloadBalance: number;   // lower current load = higher score
    skillMatch: number;        // higher proficiency = higher score
    fairness: number;          // fewer recent extra shifts/nights = higher score
    continuity: number;        // has worked this queue before = higher score
    shiftRemaining: number;    // more shift time remaining = higher score
  };
  total: number;               // weighted sum, 0–100
  disqualifiedBy: string[];    // which hard constraints blocked this person
};
```

---

## Output Shape

```typescript
type CoverageSuggestion = {
  rank: number;                         // 1 = best
  confidence: number;                   // 0–100
  summary: string;                      // one sentence for the UI card
  explanation: string;                  // full LLM-generated plain language explanation
  whyNotOthers: string;                 // why top 2–3 alternatives were not chosen
  actions: {
    userId: string;
    userName: string;
    coverFrom: string;                  // ISO datetime
    coverUntil: string;
    queueId?: string;
    note: string;                       // short reason for this person specifically
  }[];
  remainingRisk: string;                // what risk stays even if accepted
  missingData: string[];                // data gaps that would improve confidence
  requiresApproval: true;              // always true — never auto-apply
};
```

---

## LLM Prompt Structure (Phase 1)

The rule engine prepares a structured context object, then calls the LLM:

```typescript
const systemPrompt = `
You are TeamOps AI, a support workforce intelligence system.
Your job is to explain coverage recommendations in plain language.
You never make final decisions — managers always approve.
Be specific: name people, times, queues, skills.
Show the reasoning behind each suggestion.
Always mention: who is suggested, what exactly they cover, why them,
why others were not chosen, and what risk remains.
Format confidence as a percentage with a brief reason.
`;

const userPrompt = `
Coverage gap: ${gap.queueName} queue, ${gap.start} to ${gap.end}
Required skills: ${gap.skills.join(", ")}
Estimated shortage: ${gap.fteShortfall} FTE

Top candidates (ranked by rule engine):
${candidates.map(c => `
  ${c.name}: score ${c.total}/100
  - Workload: ${c.scores.workloadBalance}/100 (${c.activeTickets} active tickets)
  - Skill match: ${c.scores.skillMatch}/100 (proficiency ${c.proficiency}/5)
  - Fairness: ${c.scores.fairness}/100 (${c.extraShiftsThisWeek} extra shifts this week)
  - Shift remaining: ${c.shiftRemainingHours}h
`).join("\n")}

Disqualified candidates and why:
${disqualified.map(d => `${d.name}: ${d.disqualifiedBy.join(", ")}`).join("\n")}

Generate 2–3 coverage suggestions with full explanations.
`;
```

---

## API Route

### `POST /api/coverage/suggest`

**Permission required:** `schedule:write` (manager only)

```typescript
// Request
{
  gapStart: string;
  gapEnd: string;
  requiredSkills?: string[];
  queueId?: string;
  minimumStaff?: number;
}

// Response
{
  suggestions: CoverageSuggestion[];
  generatedAt: string;
  engineVersion: string;       // track which version produced this recommendation
}
```

### `POST /api/coverage/apply`

Apply an accepted suggestion. Creates shift assignments and audit event.
**Permission required:** `schedule:publish`

```typescript
// Request
{ suggestionId: string; modifiedActions?: { userId: string; coverFrom: string; coverUntil: string }[] }

// Response
{ status: "applied"; shiftsCreated: number; notifiedUsers: number }
```

---

## Recommendation Log (audit)

Every suggestion generated must be logged:

```typescript
await db.insert(auditEvents).values({
  action: "coverage.suggestion_generated",
  metadata: {
    gapStart, gapEnd, queueId,
    suggestionsGenerated: suggestions.length,
    engineVersion: "1.0.0-llm",
    topCandidateId: candidates[0].userId,
  }
});

// When manager accepts:
await db.insert(auditEvents).values({
  action: "coverage.suggestion_accepted",
  metadata: {
    suggestionRank: 1,
    confidence: 86,
    modifiedBeforeAccepting: false,
  }
});

// When manager rejects or modifies:
await db.insert(auditEvents).values({
  action: "coverage.suggestion_rejected",   // or "coverage.suggestion_modified"
  metadata: { reason: body.reason }
});
```

This log is how we measure: acceptance rate, confidence calibration, and engine quality.

---

## Files to Create

```
app/
  api/
    coverage/
      suggest/route.ts      ← POST handler: runs rule engine + LLM call
      apply/route.ts        ← POST handler: creates assignments + audit
  lib/
    coverage/
      rule-engine.ts        ← hard constraint checking + candidate scoring
      llm-explainer.ts      ← builds prompt, calls OpenAI API, parses response
      types.ts              ← shared TypeScript types for this module
```

---

## Definition of Done

- [ ] Rule engine correctly eliminates candidates with hard constraint violations
- [ ] Candidates are scored and ranked by soft constraints
- [ ] LLM produces plain language explanation with who/why/why-not/risk
- [ ] At least 2 suggestions returned per gap
- [ ] Every suggestion includes `requiresApproval: true`
- [ ] Apply endpoint creates shifts and writes audit event
- [ ] Rejected/modified decisions are also logged
- [ ] Engine version is recorded in every recommendation log
- [ ] No suggestion is ever auto-applied without manager action
- [ ] Works with no ticket data (graceful degradation: lower confidence, note missing data)
