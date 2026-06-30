# Phase 1 — Foundation & Infrastructure

**Goal:** A runnable backend skeleton with database (Prisma + Supabase), pgvector enabled, and Redis wired up. `GET /health` returns OK.

## Prerequisites

- Node.js 20+ and npm installed.
- Accounts/keys for Supabase, Upstash (others can wait but add them to `.env` now if available).
- Read [00-overview.md](00-overview.md).

## Tasks

### 1. Scaffold the backend

Create `backend/` with this structure:

```
backend/
├── package.json
├── tsconfig.json
├── nodemon.json
├── .gitignore
├── .env.example
├── prisma/
│   └── schema.prisma
└── src/
    ├── config/
    │   └── env.ts
    ├── lib/
    │   ├── prisma.ts
    │   └── redis.ts
    ├── middleware/
    │   └── error.middleware.ts
    ├── app.ts
    └── server.ts
```

**`package.json`** — dependencies: `express`, `cors`, `dotenv`, `@prisma/client`, `@upstash/redis`, `zod`, `cuid`, plus the libraries used in later phases (`jsonwebtoken`, `bcryptjs`, `multer`, `pdf-parse`, `cloudinary`, `groq-sdk`, `@google/generative-ai`, `socket.io`). Dev deps: `typescript`, `tsx`, `nodemon`, `prisma`, and `@types/*`. Scripts:

```json
{
  "dev": "nodemon",
  "build": "tsc",
  "start": "node dist/server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev"
}
```

**`tsconfig.json`** — `target` ES2021, `module` CommonJS, `moduleResolution` node, `strict` true, `esModuleInterop` true, `outDir` `./dist`, `rootDir` `./src`.

**`nodemon.json`** — watch `src`, run `tsx src/server.ts`.

### 2. Config loader — `src/config/env.ts`

- Load `.env` with `dotenv`.
- Export a typed `env` object for all variables in [00-overview.md](00-overview.md).
- Export `validateEnv()` that warns (does not crash) about missing vars so the server still boots during setup.

### 3. Prisma + Supabase — `prisma/schema.prisma`

- Use the **exact** schema from Section 5 of [`../../ai_support_agent_docs.md`](../../ai_support_agent_docs.md) (models: `Business`, `BusinessSettings`, `Agent`, `Document`, `DocumentChunk`, `Conversation`, `Message`; enums: `Plan`, `DocumentStatus`, `ConversationStatus`, `MessageRole`).
- Enable extensions: `previewFeatures = ["postgresqlExtensions"]` and `extensions = [pgvector(map: "vector")]`.
- `DocumentChunk.embedding` is `Unsupported("vector(768)")`.
- Add `onDelete: Cascade` on child relations so deleting a business/document cleans up.
- In the Supabase SQL editor run: `CREATE EXTENSION IF NOT EXISTS vector;`
- Run `npx prisma migrate dev --name init`.

### 4. Prisma singleton — `src/lib/prisma.ts`

Export a single `PrismaClient` instance (cache on `globalThis` in dev to avoid hot-reload connection leaks).

### 5. Redis client — `src/lib/redis.ts`

- Create an `@upstash/redis` client from env.
- Export a `redisKeys` helper object with `refreshToken(id)` and `agentPresence(id)` key builders (used in Phases 2 and 5).

### 6. Error middleware — `src/middleware/error.middleware.ts`

- Export `AppError` class (`statusCode`, `message`).
- Export `notFoundHandler` (404) and `errorHandler` (handles `ZodError` → 400, `AppError` → its status, else 500).

### 7. Express app — `src/app.ts`

- `createApp()` returns an `Express` app with CORS (origin = `CLIENT_URL`), JSON body parser, a `GET /health` route returning `{ status: "ok" }`, then `notFoundHandler` and `errorHandler` last.
- Leave commented placeholders where route modules mount in later phases.

### 8. Server entry — `src/server.ts`

- Call `validateEnv()`, create an HTTP server from the app, listen on `env.port`.
- Note that Socket.io attaches to this HTTP server in Phase 5.

## Acceptance criteria

- [ ] `npm install` completes in `backend/`.
- [ ] `npx prisma generate` succeeds.
- [ ] `npx prisma migrate dev` creates all tables in Supabase.
- [ ] `CREATE EXTENSION vector` has been run in Supabase.
- [ ] `npm run dev` starts the server on port 5000 with no crash.
- [ ] `GET http://localhost:5000/health` returns `{ "status": "ok" }`.

## Verification

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
# in another terminal:
curl http://localhost:5000/health
```
