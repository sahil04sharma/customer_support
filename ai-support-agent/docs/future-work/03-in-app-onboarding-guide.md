# 03 - In-App Onboarding Guide

## Goal

Give new users a clear, guided path so they are **never confused** about how to set up and use SupportDesk. This means a first-run checklist, a dedicated Getting Started/Help page, contextual tips on each screen, and a built-in "Test your assistant" preview so users can try the widget without touching `test.html`.

## Why it matters

- Right now a new business logs in to a dashboard with no guidance about **what to do first**.
- The correct order (upload docs -> customize -> install -> test) is not obvious.
- Testing the widget currently requires editing `widget/test.html` and pasting a key - far too technical for a normal user.
- Good onboarding directly improves activation (users who reach "first working widget").

## Current state

- After login users land on [`Overview.tsx`](../../frontend/src/pages/dashboard/Overview.tsx) (analytics only). No guidance.
- Static help text exists only on the Install page ([`EmbedCode.tsx`](../../frontend/src/components/EmbedCode.tsx)) and a note on the Knowledge base page ([`Documents.tsx`](../../frontend/src/pages/dashboard/Documents.tsx)).
- Nav is defined in [`DashboardLayout.tsx`](../../frontend/src/components/DashboardLayout.tsx).
- There is no in-app way to preview/test the widget; only the developer `test.html` exists.

## Data model changes

Minimal. Onboarding progress can be **derived** from existing data (see below), so no schema change is strictly required.

Optional (only if you want to persist dismissals/completion):

```prisma
model BusinessSettings {
  // ...existing...
  onboardingDismissed Boolean @default(false)
}
```

## Derived progress (no backend needed if computed client-side)

Compute each step from data the dashboard already fetches:

| Step | Complete when | Source |
|------|---------------|--------|
| 1. Add knowledge | at least one document with status `READY` | `GET /api/documents` ([`Documents.tsx`](../../frontend/src/pages/dashboard/Documents.tsx)) |
| 2. Customize widget | settings changed from defaults (e.g. color/name/welcome differ) | `GET /api/business/profile` |
| 3. Install on site | at least one conversation exists | `GET /api/conversations` |
| 4. Test the assistant | user opened the in-app preview at least once | local flag / optional setting |

Optionally add a tiny `GET /api/business/onboarding` endpoint in [`business.controller.ts`](../../backend/src/controllers/business.controller.ts) that returns `{ hasReadyDoc, hasCustomized, hasConversation }` so the checklist is one call.

## Frontend changes

### 1. Onboarding checklist

- New component `frontend/src/components/OnboardingChecklist.tsx`: a card with a progress ring/bar and the 4 steps, each with a status dot and a CTA link to the relevant page. Dismissible.
- Render it at the top of [`Overview.tsx`](../../frontend/src/pages/dashboard/Overview.tsx) until all steps are done (or dismissed).

### 2. Getting Started / Help page

- New page `frontend/src/pages/dashboard/GettingStarted.tsx` with:
  - A numbered walkthrough (what each dashboard section does and the recommended order).
  - A short FAQ (What is a widget key? Why upload docs? When does a human take over? Local vs production URL).
  - Links to each section and to the in-app widget test.
- Register route in [`App.tsx`](../../frontend/src/App.tsx) and add a nav item (e.g. "Getting started", `HelpCircle` icon) in [`DashboardLayout.tsx`](../../frontend/src/components/DashboardLayout.tsx).

### 3. Contextual tips + empty-state CTAs

- On each dashboard page, when there is no data yet, show an `EmptyState` with a clear next action (e.g. Knowledge base empty -> "Upload your first document"; Conversations empty -> "Install the widget to start receiving chats").
- Add short helper text/tooltips near key controls (e.g. escalation threshold explanation already exists in Settings - extend the pattern).

### 4. Test your assistant (in-app preview)

- Add a "Test your assistant" panel/page that loads the real widget against the current business, so users never edit `test.html`.
- Recommended approach: fetch the business `widgetKey` (existing `GET /api/business/widget-key`, used by [`EmbedCode.tsx`](../../frontend/src/components/EmbedCode.tsx)), then inject the widget script (`<script src="<API>/widget.js" data-widget-key="<key>">`) into the page for a live sandbox, or render an iframe pointing at a backend-served preview page.
- This ties into [02-advanced-widget-customization](02-advanced-widget-customization.md) (the live preview) and removes the biggest local-testing pain point.

## Design notes

- **Progress feels rewarding:** a ring or segmented bar that fills as steps complete; celebrate completion ("You're live!").
- Checklist steps: icon + title + one-line description + CTA button. Completed steps show a green check and mute.
- Keep copy friendly and non-technical. Explain the "why" briefly ("Upload docs so the AI can answer from your content").
- Reuse `card`, `PageHeader`, `Badge`, `EmptyState`, `btn-primary`, zinc palette, Inter font.
- Dismissible but recoverable: even after dismissing, keep a "Getting started" nav item.

## Acceptance criteria

- [ ] After first login, the Overview shows an onboarding checklist reflecting real progress.
- [ ] Each checklist step links to the correct page and marks complete based on actual data.
- [ ] A Getting Started/Help page exists, is linked in the nav, and explains setup + FAQ.
- [ ] Empty states across dashboard pages show a clear next action.
- [ ] Users can test their assistant from inside the dashboard without editing `test.html`.
- [ ] The checklist can be dismissed and hides once all steps are complete.

## Out of scope

- Product tours / interactive spotlight libraries (optional later).
- Email drip onboarding (belongs with email notifications in [05](05-additional-features-backlog.md)).
- Video tutorials/content production.
