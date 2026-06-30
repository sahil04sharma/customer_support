# Phase 8 — Polish & Deploy

**Goal:** Production-ready deployment, hardening, documentation, and a final end-to-end pass.

## Prerequisites

- Phases 1–7 complete and working locally.

## Tasks

### 1. Deploy

- **Backend → Railway:**
  - Set all env vars from `.env.example`.
  - Build: `npm run build`; start: `npm start`.
  - Run `npx prisma migrate deploy` against the production DB.
- **Frontend → Vercel:**
  - Set the API base URL and `CLIENT_URL`.
  - Build the Vite app.
- **Widget hosting:** serve `widget.js` from the backend as a static file or a CDN; ensure the script tag URL is stable.

### 2. Hardening

- Rate-limit public widget endpoints (e.g. `express-rate-limit`) to prevent abuse.
- CORS: allow any origin for widget endpoints (businesses embed on arbitrary domains) but restrict dashboard/API auth routes to `CLIENT_URL`.
- Ensure failed document processing sets `FAILED` and the UI surfaces it.
- Validate/limit upload file size and types.
- Never log secrets; confirm `.env` is gitignored.

### 3. README — `ai-support-agent/README.md`

Document: project summary, architecture diagram, prerequisites/accounts, env vars, local dev commands for each package (`backend`, `frontend`, `widget`), how to embed the widget, and deployment steps.

### 4. Final end-to-end test

1. Register a business.
2. Upload a document; wait until `READY`.
3. Copy the embed code; load it on a test page.
4. As a customer, ask a question answered by the doc → grounded answer.
5. Ask an off-topic question → escalation.
6. As an agent, accept the escalation, chat, and resolve.
7. Confirm analytics update on the dashboard.

## Acceptance criteria

- [ ] Backend deployed and reachable; `/health` returns ok in production.
- [ ] Frontend deployed; login/register works against the production API.
- [ ] `widget.js` loads from its hosted URL on an external page.
- [ ] Full customer → AI → escalation → human → resolve flow works in production.
- [ ] Rate limiting and CORS rules are in place.
- [ ] README lets a new developer set up and run everything from scratch.

## Done

When all acceptance criteria across Phases 1–8 pass, the product is complete and matches [`../../ai_support_agent_docs.md`](../../ai_support_agent_docs.md).
