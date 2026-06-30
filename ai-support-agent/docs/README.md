# AI Customer Support Agent — Build Guide

This folder contains step-by-step build instructions broken into phases. Any AI model (or human) can follow these files in order to build the full product without additional context.

## How to use this guide

1. Read [`00-overview.md`](00-overview.md) first — it explains the product, architecture, tech stack, and conventions.
2. Complete the phases in numerical order. Do not skip ahead — later phases depend on earlier ones.
3. Each phase file is self-contained and has the same structure:
   - **Goal** — what "done" means for the phase
   - **Prerequisites** — what must already exist
   - **Tasks** — concrete, ordered steps with exact file paths
   - **Acceptance criteria** — a checklist to verify before moving on
   - **Verification** — commands / manual checks to prove it works
4. Do not move to the next phase until every acceptance criterion passes.

## Source of truth

The complete product specification lives in [`../../ai_support_agent_docs.md`](../../ai_support_agent_docs.md). When this guide and the spec disagree, the spec wins. Match the spec's database schema, API paths, and Socket.io event names exactly.

## Phase index

| Phase | File | Outcome |
|-------|------|---------|
| 0 | [00-overview.md](00-overview.md) | Architecture, tech stack, conventions |
| 1 | [phase-1-foundation.md](phase-1-foundation.md) | Runnable backend, DB, pgvector, Redis |
| 2 | [phase-2-auth.md](phase-2-auth.md) | JWT auth for business + agent |
| 3 | [phase-3-rag.md](phase-3-rag.md) | Upload → chunk → embed → vector search |
| 4 | [phase-4-agent-api.md](phase-4-agent-api.md) | AI agent brain + widget REST APIs |
| 5 | [phase-5-realtime.md](phase-5-realtime.md) | Socket.io live chat + human escalation |
| 6 | [phase-6-dashboard.md](phase-6-dashboard.md) | React business + agent dashboards |
| 7 | [phase-7-widget.md](phase-7-widget.md) | Embeddable `widget.js` |
| 8 | [phase-8-deploy.md](phase-8-deploy.md) | Deploy, harden, document, final E2E |

## Working agreement

- Build phases in order; never skip Phase 3 (RAG) — it is the core differentiator.
- Match the spec's API paths, schema, and socket event names unless explicitly changed.
- Test each phase with Postman/curl before building UI for that phase.
- Keep secrets in `.env` (never commit). A `.env.example` documents every variable.
