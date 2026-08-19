# TeamOps AI — Guide for the Product Manager

> **Your job in Phase 0:** Answer the questions that developers and AI cannot answer
> from the codebase alone. You have the customer context. This guide helps you turn
> that context into documents that drive everything else.

---

## What You Own

The developers build what you define. AI helps you structure and challenge your thinking.
Neither can replace the conversations you have with real support managers and employees.

Your Phase 0 outputs (in `docs/discovery/`) become the foundation for:
- What gets built in Phase 1
- How the AI Coverage Engine is tuned
- What the pilot customer agreement looks like
- How we measure success

---

## How to Use AI for Product Work

### The core pattern: AI interviews you, not the other way around

Don't describe everything upfront. Give the AI a task and let it ask you questions.
You answer from your existing knowledge. The AI structures, challenges, and documents.

**Starting prompt for any discovery session:**

```
You are a product strategist helping me build TeamOps AI.
Read docs/PRODUCT_VISION.md and docs/TASKS.md first.

I need to complete task [P0X]: [task title].
Interview me to get the information needed.
Ask one or two questions at a time. Dig deeper before moving on.
Challenge vague answers — "support teams" is not specific enough,
"saves time" is not a metric.

When we have enough, write the output document and flag any gaps.
```

### For customer interviews (P02, P03)

```
I just finished an interview with a support manager at [company type].
Help me document it properly. I'll describe what they said,
you ask follow-up questions to fill gaps, then write the summary.

Focus on: what they do manually today, what breaks, what they'd pay to fix,
what "good" looks like to them in one sentence.
```

### For scenario writing (P05)

```
Help me write 20 realistic coverage scenarios for TeamOps AI.
I'll describe the team setup and you draft scenarios.
Each scenario needs: date/time, who is absent and why,
queue affected, current ticket load, and the question
a manager would ask ("who covers this?").
Base them on what real support teams look like.
```

### For scope decisions (P09)

```
Read docs/PRODUCT_VISION.md. I want to finalize the MVP scope.
Play devil's advocate: challenge anything that's too broad,
flag features that sound good but aren't needed for a pilot,
and push me to be specific about what "done" means for each item.
Then write a final IN/OUT list.
```

---

## Phase 0 Checklist (your tasks from TASKS.md)

Work through these in order — each one feeds the next.

### Week 1: Understand the customer

- [ ] **P01** — ICP: Who is the first customer? Be specific (company size, team size, tools, who approves budget). Use AI to structure after you draft it.
- [ ] **P02** — 5 manager interviews. Focus on: what do you open every morning, what goes wrong, how long does it take, what would you pay to fix it.
- [ ] **P03** — 5 employee interviews. Focus on: how do you find out your schedule, what's confusing, what's unfair, what would make your day easier.
- [ ] **P04** — Map the 5 data sources. Screenshot or describe each tool they use. Which data is hardest to combine?

### Week 2: Define the problem and solution

- [ ] **P05** — 20 real coverage scenarios. These test the AI engine later — be specific.
- [ ] **P06** — Workload formula. What makes one ticket harder than another? Get input from at least 2 managers.
- [ ] **P07** — Coverage rules. What's the minimum per queue/skill/hour? What does "understaffed" mean in numbers?
- [ ] **P08** — Clickable prototype of Today Command Center. Use Figma or any tool. Test with 2–3 people. Write down what confused them.

### Week 3: Lock the plan

- [ ] **P09** — Final MVP scope. IN vs. OUT. Specific. No "we'll see".
- [ ] **P10** — Pilot success metrics. Every metric needs a number and a current baseline.
- [ ] **P11** — User stories. What does the manager do, step by step? What does the employee do?
- [ ] **P12** — First pilot customer. Name, contact, what they need to agree to a pilot.

---

## Output Format for Discovery Documents

All discovery docs go in `docs/discovery/`. Use this structure:

```markdown
# [Document Title]
Date: YYYY-MM-DD
Author: [name]
Status: draft | reviewed | final

## Summary (3–5 sentences)
The key insight from this document.

## Details
[Main content]

## Open Questions
- Question 1
- Question 2

## Impact on Product
What should change in PRODUCT_VISION.md or TASKS.md based on this?
```

---

## What "Good" Looks Like for Each Output

**ICP (P01):** A developer who has never met a customer reads it and can describe
the target user in one sentence. No vague terms like "medium enterprise" or "tech company".

**Manager interviews (P02):** Each interview surfaces at least one specific number
("I spend 45 minutes every morning checking 6 tabs") and one specific failure
("Last month we missed SLA on 12 tickets because nobody noticed Ana was sick").

**Coverage scenarios (P05):** A developer can read each scenario and write a test case
for the AI engine. "Someone is absent" is not a scenario. "Ana (Linux/EMEA, Tier 2)
is sick on Tuesday. 3 active P2s in her queue. Marko (same skills) is on training 14–16h.
Jelena can cover but has 8 open tickets. Who covers and when?" is a scenario.

**MVP scope (P09):** Every item has a clear acceptance criterion.
Not "basic forecasting" — "forecast inbound ticket volume by hour for the next 24h
based on 8 weeks of historical data with ±20% accuracy".

**Pilot success metrics (P10):** Every metric has a current baseline and a target.
Not "managers save time" — "daily planning time: currently ~45 min, target ≤10 min".

---

## How Your Work Connects to the Dev Team

```
Your discovery docs
       ↓
Update PRODUCT_VISION.md (PM + AI together)
       ↓
Update TASKS.md (PM unlocks Phase 1 tasks one by one)
       ↓
Developers + AI build against the specs
       ↓
You review and validate against discovery criteria
```

You do not need to write code. You need to make decisions specific enough
that the AI can implement them without asking clarifying questions mid-session.

---

## Common Mistakes to Avoid

- **Too broad:** "Support teams need better scheduling" → not actionable. Who, what size, what tool, what breaks today?
- **Skipping validation:** Building the prototype before doing interviews → you'll build the wrong thing.
- **Metrics without baselines:** "Reduce planning time" → by how much, from what? Measure the current state first.
- **Scope creep in Phase 0:** Every "what if we also..." gets added to the backlog, not the MVP.
- **Not committing outputs:** Discovery docs that stay in your head or in Notion don't help the AI or the team. Commit them to `docs/discovery/`.
