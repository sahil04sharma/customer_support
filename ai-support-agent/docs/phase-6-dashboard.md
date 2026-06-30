# Phase 6 — Business & Agent Dashboard (Frontend)

**Goal:** A React app where business owners manage docs, conversations, agents, and settings, and support agents handle escalated chats.

## Prerequisites

- Phases 1–5 complete (full backend API + sockets).

## Tasks

### 1. Scaffold the frontend

Create `frontend/` with Vite + React + TypeScript + Tailwind.

```bash
npm create vite@latest frontend -- --template react-ts
# then add tailwindcss, react-router-dom, axios, zustand, socket.io-client,
# lucide-react, react-dropzone, recharts
```

Key infra:
- `src/lib/api.ts` — axios instance with `baseURL`, JWT `Authorization` header from the auth store, and a response interceptor that calls `/api/auth/refresh` on 401 then retries.
- `src/hooks/useAuth.ts` — Zustand store: `accessToken`, `user`, `login()`, `logout()`, persisted to `localStorage`.
- `src/hooks/useSocket.ts` — connect to the backend Socket.io, expose emit/subscribe helpers.

### 2. Routing & auth pages

- `src/pages/auth/BusinessLogin.tsx`, `BusinessRegister.tsx`.
- A `ProtectedRoute` wrapper that redirects to login when unauthenticated.
- Routes: `/login`, `/register`, `/dashboard/*`, `/agent`.

### 3. Business dashboard — `src/pages/dashboard/`

- `Overview.tsx` — analytics cards + charts (recharts) from `GET /api/analytics` (resolved, escalated, avg response time).
- `Documents.tsx` — `react-dropzone` upload, table of documents, **poll `GET /api/documents` every 5s** to reflect `PROCESSING → READY/FAILED`.
- `Conversations.tsx` — list; `ConversationDetail.tsx` — transcript view.
- `Agents.tsx` — list/invite/remove agents.
- `Settings.tsx` — edit widget color, position, welcome message, agent name, confidence threshold (`PUT /api/business/settings`).
- `EmbedCode.tsx` — show the copy-paste `<script>` tag using the business `widgetKey`.

### 4. Agent dashboard — `src/pages/agent/AgentDashboard.tsx`

- Online/offline toggle (emits `agent_online`).
- Escalation queue (listens for `new_escalation`).
- Live chat panel: `accept_conversation`, send `agent_message`, receive customer messages, `resolve_conversation`.

### 5. Backend business routes — `src/routes/business.routes.ts`

Protected by `requireBusiness`:

```
GET  /api/business/profile
PUT  /api/business/settings
GET  /api/business/widget-key
GET  /api/agents
POST /api/agents/invite
DELETE /api/agents/:id
GET  /api/analytics      # counts: resolved, escalated, avg response time
```

## Acceptance criteria

- [ ] A user can register, log in, and stay logged in across refresh (token persisted; 401 auto-refresh works).
- [ ] Documents page uploads a file and shows status flip to READY via polling.
- [ ] Settings changes persist and are reflected in the widget preview/embed.
- [ ] Conversations list and detail show real data scoped to the business.
- [ ] Agents can be invited, listed, and removed.
- [ ] Agent dashboard receives `new_escalation` and can chat + resolve in real time.

## Verification

```bash
cd frontend
npm install
npm run dev   # open http://localhost:5173
```
Walk through: register → upload doc → wait READY → adjust settings → open agent dashboard in a second browser/profile.
