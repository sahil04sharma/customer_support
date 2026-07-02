# Future Work

This folder documents the next wave of features for **SupportDesk** (the AI Customer Support SaaS). Phases 1-8 in [`../`](../) built and hardened the core product. These specs describe what to build next.

Each file is written so that **any AI agent or developer can pick it up and implement it without extra context**. Read the source-of-truth spec ([`../../../ai_support_agent_docs.md`](../../../ai_support_agent_docs.md)) and the phase docs first if you are new to the codebase.

---

## How to use this folder

1. Pick a spec from the index below (respect the priority order unless told otherwise).
2. Read it top to bottom. Every spec is self-contained.
3. Follow the **Tasks** section in order. File paths are exact.
4. Do not mark a spec done until every box in **Acceptance criteria** passes.
5. Match existing conventions: TypeScript, Prisma, Express, React + Vite + Tailwind, Socket.io. Reuse the shared UI primitives (`PageHeader`, `Badge`, `EmptyState`, `card`, `btn-primary`, zinc palette, Inter font).

---

## Index & priority

| # | Spec | Outcome | Priority |
|---|------|---------|----------|
| 01 | [platform-admin-panel](01-platform-admin-panel.md) | Owner-only console to see every business, user, usage & AI cost | High |
| 02 | [advanced-widget-customization](02-advanced-widget-customization.md) | Custom images, shapes, themes, live preview | High |
| 03 | [in-app-onboarding-guide](03-in-app-onboarding-guide.md) | Step-by-step guidance so users are never confused | Medium |
| 04 | [knowledge-base-guidance](04-knowledge-base-guidance.md) | Readiness meter + nudge to upload all content | Medium |
| 05 | [additional-features-backlog](05-additional-features-backlog.md) | Billing, plan limits, key rotation, emails, CSAT, and more | Mixed |

**Suggested build order:** 01 -> 04 -> 03 -> 02 -> 05. Rationale: the admin panel and usage metering (01) protect your costs first; knowledge-base guidance (04) and onboarding (03) improve activation; widget polish (02) improves perceived quality; the backlog (05) is picked from as needed.

---

## Standard spec template

Every spec in this folder follows the **same structure** so agents can follow it uniformly. When adding a new spec, copy this outline:

```md
# <Number> - <Feature Name>

## Goal
One sentence describing what "done" looks like.

## Why it matters
Business value in 2-4 bullets.

## Current state
What exists today, citing real files and line references.

## Data model changes
Prisma snippets to add/modify in backend/prisma/schema.prisma.

## Backend changes
Routes, controllers, services, middleware - with exact file paths.

## Frontend changes
Pages, components, routes, nav - with exact file paths.

## Design notes
Visual/UX guidance. Reuse existing primitives. Describe layout, states, copy.

## Acceptance criteria
- [ ] Checkable, testable statements.

## Out of scope
What this spec deliberately does NOT cover.
```

---

## Conventions reference

- **Backend:** Express + TypeScript in [`../../backend/src`](../../backend/src). Routes -> controllers -> services. Errors via `AppError` ([`error.middleware.ts`](../../backend/src/middleware/error.middleware.ts)). Validation via Zod schemas in `backend/src/validation/`.
- **Database:** Prisma + Supabase Postgres + pgvector ([`schema.prisma`](../../backend/prisma/schema.prisma)). Vector columns require raw SQL (`$queryRaw` / `$executeRaw`).
- **Auth:** JWT access + refresh, Redis-backed. Business and Agent are separate roles. Widget endpoints are public (authenticated by `widgetKey` + `conversationId`).
- **Frontend:** React + Vite + Tailwind in [`../../frontend/src`](../../frontend/src). Dashboard shell in [`DashboardLayout.tsx`](../../frontend/src/components/DashboardLayout.tsx). Charts via Recharts.
- **Widget:** Standalone IIFE build in [`../../widget`](../../widget); output is `widget.js` served by the backend.
- **Secrets:** always in `.env`, never committed. Document new vars in `backend/.env.example`.
- **Migrations:** the project currently uses `prisma db push`. New models below assume that continues; see spec 05 for migrating to formal migrations.
