# TeamOps AI — Claude Code

TeamOps AI is a B2B SaaS platform for **Support Workforce Intelligence**.
It helps support managers see daily operational state (who works, coverage gaps,
SLA risk, backlog, escalations) and get explainable AI coverage recommendations.
Human approval is always required before AI output affects real data.

**Phase 0 — Discovery.** Team: Product/CEO, Frontend dev, Backend dev.

---

## Read These Files (in order)

| File | Purpose |
|---|---|
| [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) | What we're building, why, for whom — read once |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Current phase and feature status |
| [docs/TASKS.md](docs/TASKS.md) | Granular task board — read every session, pick the next `[ ]` task |
| [docs/PATTERNS.md](docs/PATTERNS.md) | How code is written in this project, with real examples |
| [docs/features/](docs/features/) | Detailed buildable specs for each feature |
| [docs/FOR_PRODUCT_MANAGER.md](docs/FOR_PRODUCT_MANAGER.md) | How the PM uses AI for discovery and planning |

> **Current active phase: Phase 0 — Discovery.**
> No dev tasks start until Phase 0 PM tasks in TASKS.md are complete.

---

## Quick Reference

```bash
npm ci                      # install (lockfile — do not update without reason)
npm run dev                 # local dev server
npm run build               # production build
npm test                    # run tests
npm run lint                # lint
npx drizzle-kit generate    # generate migration after schema change
npx drizzle-kit migrate     # apply migrations locally
wrangler deploy             # deploy to Cloudflare
```

**Stack:** Next.js 16.2.6 · React 19 · TypeScript 5.9.3 (strict) · Cloudflare Workers (vinext) · Drizzle ORM + D1 → Neon · Tailwind CSS 4
**Auth:** Sign in with ChatGPT (SIWC) via OpenAI workspace headers
**Deploy:** OpenAI Sites via Wrangler
