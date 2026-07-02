# 01 - Platform Admin Panel

## Goal

A separate, owner-only console (super-admin) at `/admin` where **you, the platform owner**, can see every business using SupportDesk, their users, their activity, and how much AI usage/cost each one is generating - and take basic account actions (change plan, suspend).

This is **not** the per-business dashboard. The existing dashboard shows one tenant their own data. This new panel sits **above all tenants**.

## Why it matters

- You currently have **no way to see who uses your product**. There is no cross-tenant view anywhere.
- All AI calls run on **your** Groq + Gemini keys, so you need to see **who is consuming tokens** before costs surprise you.
- It is the foundation for billing, plan-limit enforcement, and abuse detection (see [05-additional-features-backlog](05-additional-features-backlog.md)).

## Current state

- There is **no super-admin role**. `Business` and `Agent` are the only account types ([`schema.prisma`](../../backend/prisma/schema.prisma)).
- Auth issues tokens with `role: 'BUSINESS'` or `role: 'AGENT'` only ([`auth.controller.ts`](../../backend/src/controllers/auth.controller.ts)).
- Analytics is per-tenant and computed on the fly ([`business.controller.ts`](../../backend/src/controllers/business.controller.ts) `getAnalytics`) - it counts only `req.auth.businessId`.
- There is **no usage tracking**. AI calls in [`agent.ts`](../../backend/src/services/agent.ts) and embeddings in [`embeddings.ts`](../../backend/src/services/embeddings.ts) are not recorded anywhere.

## Data model changes

Add to [`schema.prisma`](../../backend/prisma/schema.prisma):

```prisma
// ─── PLATFORM ADMIN (you, the owner) ─────────────────────────────
model PlatformAdmin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
}

// ─── USAGE EVENT (metering for cost + limits) ────────────────────
model UsageEvent {
  id             String        @id @default(cuid())
  businessId     String
  type           UsageType
  model          String?       // e.g. "llama-3.1-8b-instant", "gemini-embedding-001"
  promptTokens   Int           @default(0)
  outputTokens   Int           @default(0)
  totalTokens    Int           @default(0)
  estimatedCost  Float         @default(0) // USD estimate at capture time
  conversationId String?
  createdAt      DateTime      @default(now())

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@index([businessId, createdAt])
  @@index([type, createdAt])
}

enum UsageType {
  AI_MESSAGE       // Groq chat completion
  EMBEDDING        // Gemini embedding (upload or query)
  WIDGET_LOAD      // optional: widget.js served / conversation started
}
```

Add the back-relation and a status field to `Business`:

```prisma
model Business {
  // ...existing fields...
  status      BusinessStatus @default(ACTIVE)
  usageEvents UsageEvent[]
}

enum BusinessStatus {
  ACTIVE
  SUSPENDED
}
```

Apply with `npx prisma db push` (or a migration, see [05](05-additional-features-backlog.md)). Seed the first admin with a one-off script or a guarded `POST /api/admin/bootstrap` that only works when the `PlatformAdmin` table is empty.

## Backend changes

### 1. Record usage (foundation)

Create `backend/src/services/usage.service.ts`:

- `recordUsage({ businessId, type, model, promptTokens, outputTokens, conversationId })`
- Compute `estimatedCost` from a small rate table (per-million-token prices per model). Keep rates in one constant so they are easy to update.
- Call it from:
  - [`agent.ts`](../../backend/src/services/agent.ts) after the Groq completion (use `response.usage` for token counts).
  - [`embeddings.ts`](../../backend/src/services/embeddings.ts) after each embedding (estimate tokens from input length if the API does not return them).
- Make recording **best-effort** (wrap in try/catch, never block or fail a user request because metering failed).

### 2. Admin auth

- Add `loginAdmin` to [`auth.controller.ts`](../../backend/src/controllers/auth.controller.ts) (or a new `admin.auth.controller.ts`), issuing a JWT with `role: 'ADMIN'`.
- Add `requireSuperAdmin` middleware in `backend/src/middleware/auth.middleware.ts` that verifies the token and confirms `role === 'ADMIN'` and the `PlatformAdmin` still exists.
- Reuse the existing token/refresh plumbing in `auth.service.ts`.

### 3. Admin routes + controller

Create `backend/src/routes/admin.routes.ts` and `backend/src/controllers/admin.controller.ts`. Mount in [`app.ts`](../../backend/src/app.ts) as `app.use('/api/admin', apiLimiter, adminRoutes)` (all routes after `requireSuperAdmin`).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/admin/login` | Admin login (public) |
| GET | `/api/admin/metrics` | Platform KPIs: total businesses, active/suspended, total conversations, messages, tokens, estimated cost, new signups (7/30d) |
| GET | `/api/admin/businesses` | Paginated list: name, email, plan, status, #agents, #docs, #conversations, tokens, cost, createdAt, lastActivity. Support `?search=` and `?sort=`. |
| GET | `/api/admin/businesses/:id` | Full detail: profile, settings, agents, document counts by status, conversation counts by status, usage over time |
| GET | `/api/admin/usage?range=30d` | Time-series usage/cost across all tenants (for charts), plus top consumers |
| PATCH | `/api/admin/businesses/:id/plan` | Change plan (FREE/PRO) |
| PATCH | `/api/admin/businesses/:id/status` | Suspend / reactivate |

Notes:
- Use Prisma `groupBy` / `count` / `aggregate` for metrics; avoid N+1 by aggregating `UsageEvent` per business.
- When a business is `SUSPENDED`, block its widget: check status in [`widget.controller.ts`](../../backend/src/controllers/widget.controller.ts) `startWidgetConversation` and in the socket `customer_message` handler ([`socketHandler.ts`](../../backend/src/socket/socketHandler.ts)); return a clear error.

## Frontend changes

Create an `/admin` area, fully separate from the tenant dashboard.

- Route registration in [`App.tsx`](../../frontend/src/App.tsx): `/admin/login` and a protected `/admin/*` group.
- New `frontend/src/pages/admin/`:
  - `AdminLogin.tsx` - reuse `AuthLayout`.
  - `AdminLayout.tsx` - sidebar shell like [`DashboardLayout.tsx`](../../frontend/src/components/DashboardLayout.tsx) but visually distinct (see design notes).
  - `AdminOverview.tsx` - KPI cards + trend charts (reuse Recharts patterns from [`Overview.tsx`](../../frontend/src/pages/dashboard/Overview.tsx)).
  - `AdminBusinesses.tsx` - searchable/sortable table of all tenants.
  - `AdminBusinessDetail.tsx` - one tenant's full profile, usage, and plan/status actions.
  - `AdminUsage.tsx` - cross-tenant usage & cost, top consumers.
- Auth: extend the auth store/`ProtectedRoute` to understand an `ADMIN` role, or add a dedicated `AdminProtectedRoute`. Keep admin tokens separate from tenant tokens so logging into one does not affect the other.

## Design notes

- **Distinct identity:** the tenant dashboard uses a light zinc theme. Give the admin console a **darker "operator console" chrome** (e.g. near-black sidebar, subtle accent color) so it is instantly obvious you are in the god-view, not a customer view.
- **Data-dense but calm:** KPI cards at top (Businesses, Active, Conversations, Tokens, Est. cost this month), then charts (signups over time, tokens/cost over time), then the businesses table.
- **Business table columns:** Name/email, Plan (`Badge`), Status (`Badge` - green ACTIVE / red SUSPENDED), Agents, Docs, Conversations, Tokens, Est. cost, Last active. Row click -> detail.
- **Detail page:** header with name/plan/status and action buttons (Change plan, Suspend/Reactivate with confirm), then usage chart, then breakdowns.
- Reuse `PageHeader`, `Badge`, `EmptyState`, `card`, `btn-primary`, `btn-secondary`. Keep Inter font.
- Empty and loading states everywhere (spinner pattern already used in dashboard pages).

## Acceptance criteria

- [ ] A `PlatformAdmin` can log in at `/admin/login` and non-admins cannot reach `/admin/*` or `/api/admin/*`.
- [ ] `UsageEvent` rows are written for every Groq completion and every Gemini embedding, without breaking the user flow when metering fails.
- [ ] `/api/admin/metrics` returns correct platform-wide totals.
- [ ] The businesses list shows every tenant with plan, status, counts, tokens, and estimated cost; search and sort work.
- [ ] Business detail shows usage over time and allows changing plan and suspending/reactivating.
- [ ] A suspended business's widget cannot start new conversations or send messages.
- [ ] Admin UI is visually distinct from the tenant dashboard and reuses shared UI primitives.

## Out of scope

- Billing/invoicing and payment collection (see [05](05-additional-features-backlog.md)).
- Enforcing plan **limits** at request time (metering here is the data foundation; enforcement is spec 05).
- Multiple admin roles/permissions - a single super-admin is enough for now.
