# SupportDesk

Multi-tenant AI customer support SaaS: businesses upload a knowledge base, embed a chat widget on their site, and let an AI agent answer questions with human escalation when needed.

## Architecture

```
┌─────────────┐     REST + Socket.io      ┌──────────────────┐
│  Dashboard  │ ◄────────────────────────►│  Express API     │
│  (React)    │                             │  + Socket.io     │
└─────────────┘                             └────────┬─────────┘
                                                     │
┌─────────────┐     widget.js + sockets              │
│  Embed      │ ◄────────────────────────────────────┤
│  (any site) │                                      │
└─────────────┘                             ┌────────▼─────────┐
                                            │ Supabase Postgres │
┌─────────────┐                             │ (pgvector)        │
│  Agent      │ ◄───────────────────────────┤ Upstash Redis     │
│  portal     │                             │ Cloudinary        │
└─────────────┘                             │ Groq + Gemini     │
                                            └──────────────────┘
```

| Package | Role |
|---------|------|
| `backend/` | API, AI agent, RAG, sockets, widget session auth |
| `frontend/` | Business dashboard + agent portal |
| `widget/` | Embeddable chat bundle → `widget/dist/widget.js` |

## Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) Postgres (enable **pgvector**)
- [Upstash](https://upstash.com) Redis (REST URL + token)
- [Groq](https://groq.com) + [Google AI](https://ai.google.dev) API keys
- [Cloudinary](https://cloudinary.com) for document/image uploads
- Optional: [Resend](https://resend.com) for production email

## Local development

### 1. Database

Copy `backend/.env.example` → `backend/.env` and set `DATABASE_URL` to the **direct** Supabase port (`5432`, not the pooler).

```bash
cd backend
npm install
npx prisma migrate deploy   # or: npx prisma db push (dev only)
npx prisma generate
npm run dev                 # http://localhost:5000
```

> On Windows, stop the backend before `npx prisma generate` if you hit a DLL lock (EPERM).

### 2. Dashboard

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5173
```

### 3. Widget

```bash
cd widget
npm install
npm run build               # outputs widget/dist/widget.js
```

The backend serves the bundle at `http://localhost:5000/widget.js`.

### Smoke tests

With the API running:

```bash
cd backend
npm run smoke          # REST: health, auth, pagination, widget session
npm run smoke:socket   # Socket: JWT auth on agent events
```

## Environment variables

See `backend/.env.example` for the full list. Key values:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection (use port 5432 for migrations) |
| `GROQ_API_KEY` / `GEMINI_API_KEY` | LLM + embeddings |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Sessions, rate limits, presence |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Dashboard + agent auth |
| `CLOUDINARY_*` | File uploads |
| `CLIENT_URL` | Dashboard origin (CORS) |
| `ALLOWED_ORIGINS` | Extra allowed dashboard URLs (comma-separated) |
| `TRUST_PROXY` | Set `true` behind Railway/Render/nginx |
| `RESEND_API_KEY` / `EMAIL_FROM` | Production email (logs to console in dev) |
| `ENCRYPTION_KEY` | Encrypts tenant BYOK API keys (32+ chars) |

Frontend: `VITE_API_URL` → backend base URL.

## Bring your own AI keys (BYOK)

Free plan includes **150 hosted AI replies/month**. Businesses can add their own keys at **Dashboard → AI keys** (`/dashboard/ai`):

| | Hosted (default) | BYOK |
|--|--|--|
| Chat | Your platform Groq key | OpenAI, Anthropic, Groq, or Gemini |
| Embeddings | Your platform Gemini key | OpenAI or Gemini |
| Message cap | 150/month | Unlimited (they pay provider) |

- Chat and embedding keys are **separate** (Anthropic has no embedding API).
- Keys are encrypted at rest with `ENCRYPTION_KEY`.
- Changing embedding provider re-indexes all documents.


## Embed the widget

After registering and uploading docs, open **Dashboard → Embed** and copy the snippet. Minimal example:

```html
<script
  src="https://YOUR_API_HOST/widget.js"
  data-widget-key="YOUR_WIDGET_KEY"
  async
></script>
```

Restrict origins under **Settings → Allowed domains** (empty = allow all in development).

## Deployment

### Backend (Railway / Render)

1. Set root directory to `ai-support-agent` (includes both `backend/` and `widget/`).
2. Set all env vars from `.env.example`.
3. Build: see `railway.toml` (widget + backend); Start: `cd backend && npm start`.
4. Run migrations: `npx prisma migrate deploy` (included in Railway start command).
5. Set `TRUST_PROXY=true`, `NODE_ENV=production`, and strong JWT secrets (32+ chars).
6. Set `CLIENT_URL` and `ALLOWED_ORIGINS` to your Vercel frontend URL.

### Frontend (Vercel)

1. Root directory: `frontend`.
2. Set `VITE_API_URL` to the production API URL.
3. Build command: `npm run build` → Output: `dist`.

### Widget

Build in CI or locally (`cd widget && npm run build`) and deploy `widget/dist/widget.js` with the backend (default) or a CDN. Update the embed snippet URL accordingly.

### Production checklist

- [ ] `GET /health` returns `{ "status": "ok" }`
- [ ] `npx prisma migrate deploy` applied (not `db push`)
- [ ] Rate limits active (Upstash configured)
- [ ] Widget loads on an external test page
- [ ] Full flow: customer → AI → escalation → agent → resolve
- [ ] Analytics update on the dashboard

## Manual E2E test

1. Register a business at `/register`.
2. Upload a PDF/TXT doc; wait until status is **Ready**.
3. Open **Test assistant** or embed the widget on a local HTML page.
4. Ask a question covered by the doc → grounded AI answer.
5. Ask something off-topic → escalation.
6. Sign in at `/agent`, go online, accept the chat, reply, resolve.
7. Confirm conversation appears on **Conversations** and analytics on **Overview**.

## Docs

Phase-by-phase build guide: [`docs/README.md`](docs/README.md)  
Deploy details: [`docs/phase-8-deploy.md`](docs/phase-8-deploy.md)  
Future work backlog: [`docs/future-work/README.md`](docs/future-work/README.md)

## Scripts reference

| Location | Command | Description |
|----------|---------|-------------|
| `backend/` | `npm run dev` | API + sockets (nodemon) |
| `backend/` | `npm run build` | Compile TypeScript |
| `backend/` | `npm run smoke` | REST smoke test |
| `backend/` | `npm run smoke:socket` | Socket auth smoke test |
| `frontend/` | `npm run dev` | Dashboard dev server |
| `widget/` | `npm run build` | Build embeddable bundle |
