# Phase 0 — Overview, Architecture & Conventions

Read this before any phase. It gives every model the shared context needed to build consistently.

## What we are building

A multi-tenant SaaS where any business can:

1. Sign up and upload knowledge base documents (FAQs, policies, product docs).
2. Get an embeddable chat widget to paste on their website.
3. Have an AI agent answer customer questions using their documents (RAG).
4. Escalate to a human support agent in real time when AI confidence is low.

## Three user roles

| User | Role |
|------|------|
| Business Owner | Signs up, uploads docs, manages agents, views dashboard |
| Support Agent | Employee of the business, handles escalated chats |
| Customer | Visitor on the business's website, chats with AI |

## Architecture

```mermaid
flowchart TB
  subgraph client [Client Layer]
    Dashboard[React Dashboard]
    Widget[Embeddable widget.js]
    AgentUI[Agent Dashboard]
  end

  subgraph backend [Backend - Express + Socket.io]
    API[REST API]
    Socket[Socket.io]
  end

  subgraph ai [AI Pipeline]
    Embed[Gemini Embeddings]
    Groq[Groq LLaMA 3.1]
    RAG[Vector Search pgvector]
  end

  subgraph data [Data Layer]
    PG[(Supabase PostgreSQL)]
    Redis[(Upstash Redis)]
    Cloudinary[Cloudinary Files]
  end

  Dashboard --> API
  Widget --> API
  AgentUI --> API
  Widget --> Socket
  AgentUI --> Socket
  API --> PG
  API --> Redis
  API --> Cloudinary
  API --> Embed
  API --> Groq
  Embed --> RAG
  RAG --> PG
  Groq --> RAG
```

## Tech stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + TypeScript + Tailwind CSS | Clean, typed UI |
| Backend | Node.js + Express + TypeScript | API server + agent logic |
| Database | Supabase (PostgreSQL) | Regular data + pgvector for embeddings |
| ORM | Prisma | Type-safe database queries |
| Vector Search | pgvector | Semantic similarity search |
| Real-time | Socket.io | Live chat between customer and human agent |
| Cache | Redis (Upstash) | Active session + presence management |
| AI Model | Groq API (LLaMA 3.1) | Fast LLM responses |
| Embeddings | Gemini text-embedding-004 (768 dims) | Convert text to vectors |
| File Uploads | Cloudinary | Store uploaded documents |
| Auth | JWT (access + refresh tokens) | Secure authentication |
| Frontend Deploy | Vercel | Free, fast |
| Backend Deploy | Railway | Simple Node.js hosting |

## Repository layout

```
ai-support-agent/
├── backend/          # Express + Prisma + Socket.io
├── frontend/         # Business + agent dashboards (Vite + React)
├── widget/           # Standalone embeddable build → widget.js
├── docs/             # This build guide
└── README.md
```

## How RAG works here

```
SETUP (once per uploaded document)
1. Business uploads a PDF or TXT file
2. Extract raw text
3. Split into chunks (~400 words, 50-word overlap)
4. Embed each chunk with Gemini text-embedding-004 (768 numbers)
5. Store chunk text + vector in PostgreSQL (pgvector)

QUERY (every customer message)
1. Customer asks a question
2. Embed the question with the same model
3. Search pgvector for top-5 chunks by cosine similarity
4. Build context from those chunks + the question
5. Ask Groq (LLaMA 3.1) to answer using ONLY that context
6. If top similarity < confidenceThreshold → escalate to a human
```

## Conventions every model must follow

- **Language:** TypeScript everywhere. `strict` mode on.
- **Vector columns:** Prisma cannot read/write `vector` natively. Always use `$executeRaw` / `$queryRaw` for inserting and searching embeddings.
- **Multi-tenancy:** Every query that touches business data MUST be scoped by `businessId`. Never leak data across tenants.
- **Auth:** Dashboard/agent routes require a JWT. Widget routes are public and authenticated by `widgetKey` + `conversationId` only (no cookies).
- **Validation:** Validate all request bodies with `zod`.
- **Errors:** Throw `AppError(statusCode, message)`; the central error middleware formats responses.
- **Secrets:** Read config only through `src/config/env.ts`. Never hardcode keys.
- **Naming:** Keep file names, API paths, and Socket.io event names identical to the spec.

## External accounts required

Create these and collect API keys before Phase 1:

| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL + pgvector |
| Groq | LLM chat completions |
| Google AI (Gemini) | Text embeddings |
| Upstash | Redis |
| Cloudinary | Document file storage |

## Environment variables (backend `.env`)

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
PORT=5000
CLIENT_URL="http://localhost:5173"
```
