# Phase 2 — Authentication

**Goal:** JWT-based auth (access + refresh) for business owners and support agents, with protected-route middleware.

## Prerequisites

- Phase 1 complete (server boots, DB connected).
- `JWT_SECRET` and `JWT_REFRESH_SECRET` set in `.env`.

## Tasks

### 1. Auth utilities — `src/services/auth.service.ts`

- `hashPassword(plain)` / `verifyPassword(plain, hash)` using `bcryptjs`.
- `signAccessToken(payload)` — short-lived (e.g. 15m) with `jsonwebtoken`, signed with `JWT_SECRET`.
- `signRefreshToken(payload)` — long-lived (e.g. 7d), signed with `JWT_REFRESH_SECRET`.
- Token payload shape: `{ sub: string, role: "BUSINESS" | "AGENT", businessId: string }`.
- Store refresh tokens in Redis: key `redisKeys.refreshToken(sub)`, value = the token, with TTL matching the refresh expiry. On logout/refresh, validate against the stored value and rotate.

### 2. Validation schemas — `src/validation/auth.schema.ts`

Zod schemas:
- `registerBusinessSchema`: `{ name, email (email), password (min 8) }`
- `loginSchema`: `{ email, password }`

### 3. Controllers — `src/controllers/auth.controller.ts`

- `registerBusiness`: validate body → ensure email unique → hash password → create `Business` **and** a default `BusinessSettings` (use a Prisma nested create or transaction) → issue tokens → return `{ accessToken, business }` (never return the password hash).
- `loginBusiness`: validate → find business by email → verify password → issue tokens.
- `loginAgent`: same flow against the `Agent` table.
- `refresh`: read refresh token → verify signature → check it matches the value in Redis → issue a new access token (and rotate refresh token).
- `logout`: delete the refresh token key from Redis.

### 4. Routes — `src/routes/auth.routes.ts`

```
POST /api/auth/business/register
POST /api/auth/business/login
POST /api/auth/agent/login
POST /api/auth/refresh
POST /api/auth/logout
```

Mount in `app.ts`: `app.use('/api/auth', authRoutes)`.

### 5. Auth middleware — `src/middleware/auth.middleware.ts`

- `requireAuth`: read `Authorization: Bearer <token>`, verify with `JWT_SECRET`, attach `req.auth = { sub, role, businessId }`. Throw `AppError(401, ...)` if missing/invalid.
- `requireBusiness`: `requireAuth` + assert `role === "BUSINESS"`.
- `requireAgent`: `requireAuth` + assert `role === "AGENT"`.
- Extend the Express `Request` type (e.g. `src/types/express.d.ts`) to include `auth`.

## Acceptance criteria

- [ ] Registering a business creates a `Business` + a `BusinessSettings` row with defaults.
- [ ] Login returns a valid access token and sets a refresh token in Redis.
- [ ] A protected test route rejects requests without a valid token (401).
- [ ] `refresh` issues a new access token only when the refresh token matches Redis.
- [ ] `logout` invalidates the refresh token (subsequent refresh fails).
- [ ] Password hashes are never returned in any response.

## Verification

```bash
# register
curl -X POST http://localhost:5000/api/auth/business/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme","email":"owner@acme.com","password":"password123"}'

# login
curl -X POST http://localhost:5000/api/auth/business/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@acme.com","password":"password123"}'
```
