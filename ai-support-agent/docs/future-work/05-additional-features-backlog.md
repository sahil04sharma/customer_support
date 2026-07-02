# 05 - Additional Features Backlog

## Goal

A curated, prioritized list of features that turn SupportDesk from a working product into a **sellable, cost-safe SaaS**. Each item is a mini-spec: what it is, why it matters, where it touches the code, and acceptance criteria. Pick items independently.

## Why it matters

The core product works, but several gaps block real customers: AI cost is uncontrolled, there is no billing, and operational polish is missing. This backlog captures those, roughly in order of impact.

---

## A. Plan limits enforcement + usage metering (High)

**What:** Enforce per-plan usage caps (e.g. FREE = N AI conversations/month, PRO = higher) using the `UsageEvent` data from [01-platform-admin-panel](01-platform-admin-panel.md).

**Why:** All AI runs on your keys. Without limits, one tenant can burn your Groq/Gemini budget. `Plan` (FREE/PRO) exists in [`schema.prisma`](../../backend/prisma/schema.prisma) but is **never enforced**.

**Where:**
- Read current-period usage before answering in the socket `customer_message` handler ([`socketHandler.ts`](../../backend/src/socket/socketHandler.ts)) and in [`widget.controller.ts`](../../backend/src/controllers/widget.controller.ts).
- Add a `plan.service.ts` with plan limit constants and an `assertWithinLimits(businessId)` helper.
- When over limit: return a friendly widget message ("Support is temporarily unavailable") and notify the business.

**Acceptance:** over-limit tenants stop consuming AI; usage resets each billing period; limits differ by plan.

---

## B. Billing & subscriptions (High)

**What:** Stripe-based subscriptions with trials and invoices, wired to `Plan`.

**Why:** No way to charge customers today. Needed before launch.

**Where:**
- New `billing.routes.ts` + `billing.controller.ts`; Stripe Checkout + Customer Portal; webhook to update `Business.plan` on subscribe/cancel.
- Add `stripeCustomerId`, `subscriptionStatus`, `currentPeriodEnd` to `Business` in [`schema.prisma`](../../backend/prisma/schema.prisma).
- Frontend Billing page under the dashboard (upgrade/downgrade, invoice history).
- New env vars in [`.env.example`](../../backend/.env.example): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs.

**Acceptance:** a business can start a trial, subscribe, see invoices, and cancel; plan changes reflect in the app.

---

## C. Widget key rotation (Medium)

**What:** Let a business regenerate its `widgetKey` if it leaks or is abused.

**Why:** The key is public and permanent today; there is no way to rotate it. Generated once at signup ([`schema.prisma`](../../backend/prisma/schema.prisma) `widgetKey @default(cuid())`).

**Where:** `POST /api/business/widget-key/rotate` in [`business.controller.ts`](../../backend/src/controllers/business.controller.ts); update the Install page ([`EmbedCode.tsx`](../../frontend/src/components/EmbedCode.tsx)) with a "Regenerate" action and a warning that the old snippet stops working.

**Acceptance:** rotating issues a new key, invalidates the old one, and the Install snippet updates.

---

## D. Email notifications (Medium)

**What:** Transactional emails: welcome, password reset, escalation alerts to the business/agents, optional daily summary.

**Why:** No email exists. Password reset and escalation alerts are essential for real use.

**Where:** `email.service.ts` (Resend/SendGrid/SMTP); trigger on register ([`auth.controller.ts`](../../backend/src/controllers/auth.controller.ts)) and on escalation ([`socketHandler.ts`](../../backend/src/socket/socketHandler.ts) `new_escalation`). Add provider env vars.

**Acceptance:** users receive welcome + reset emails; a business is emailed when a chat escalates and no agent is online.

---

## E. CSAT rating + transcript export (Medium)

**What:** After a chat, ask the customer to rate it; let businesses export a conversation transcript.

**Why:** Measures quality; export is a common support requirement.

**Where:** add a `rating`/`feedback` to `Conversation` in [`schema.prisma`](../../backend/prisma/schema.prisma); widget prompts for rating on `conversation_resolved` ([`ChatWindow.tsx`](../../widget/src/ChatWindow.tsx)); dashboard shows ratings and adds an export button on [`ConversationDetail.tsx`](../../frontend/src/pages/dashboard/ConversationDetail.tsx).

**Acceptance:** customers can rate a resolved chat; businesses can view ratings and export a transcript.

---

## F. Canned responses / macros for agents (Low-Medium)

**What:** Reusable reply snippets for human agents.

**Why:** Speeds up human replies in the Agent portal and dashboard.

**Where:** `CannedResponse` model (per business); insert UI in [`AgentDashboard.tsx`](../../frontend/src/pages/agent/AgentDashboard.tsx) and the reply box on [`ConversationDetail.tsx`](../../frontend/src/pages/dashboard/ConversationDetail.tsx).

**Acceptance:** agents can save and insert canned responses.

---

## G. Multi-language + configurable AI persona (Low-Medium)

**What:** Let businesses set the AI's language and tone/persona; optionally auto-detect customer language.

**Why:** Broadens the addressable market and brand fit.

**Where:** add persona/language fields to `BusinessSettings`; inject into the system prompt in [`agent.ts`](../../backend/src/services/agent.ts); expose in Settings.

**Acceptance:** the AI answers in the configured language/tone.

---

## H. Business-provided API keys / BYOK (Low)

**What:** Let larger customers plug in their **own** Groq/Gemini keys so their AI usage bills to them, not you.

**Why:** Removes your biggest variable cost for heavy tenants.

**Where:** encrypted key fields on `Business`; the agent/embedding services ([`agent.ts`](../../backend/src/services/agent.ts), [`embeddings.ts`](../../backend/src/services/embeddings.ts)) prefer the tenant's key when present, else fall back to platform keys.

**Acceptance:** when a tenant sets keys, their AI calls use those keys; usage is attributed accordingly.

---

## I. Observability, audit logs & migration hygiene (Low, ongoing)

**What:** Error monitoring (Sentry), basic audit logs for sensitive actions (plan/status changes, key rotation), and moving from `prisma db push` to formal migrations.

**Why:** Production reliability and safe schema evolution. The project currently uses `db push` with no `prisma/migrations/` history.

**Where:** add Sentry to [`server.ts`](../../backend/src/server.ts)/[`app.ts`](../../backend/src/app.ts); an `AuditLog` model; adopt `prisma migrate` going forward (baseline the current schema, then use migrations for all future changes in these specs).

**Acceptance:** errors are reported centrally; sensitive actions are logged; schema changes ship via migrations.

---

## Priority summary

| Priority | Items |
|----------|-------|
| High | A (plan limits), B (billing) |
| Medium | C (key rotation), D (emails), E (CSAT/export), G (i18n/persona) |
| Low | F (macros), H (BYOK), I (observability/migrations) |

Do **A** and **B** first (protect costs + enable revenue), ideally right after [01-platform-admin-panel](01-platform-admin-panel.md) provides the usage data they depend on.

## Out of scope (for now)

- Mobile SDKs / native apps.
- Marketplace integrations (Slack, WhatsApp, Zendesk) - separate future track.
- Fine-tuning or self-hosted models.
