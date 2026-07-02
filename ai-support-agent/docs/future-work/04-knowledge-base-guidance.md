# 04 - Knowledge Base Upload Guidance

## Goal

Make it obvious that **answer quality depends on how much relevant content is uploaded**, and actively guide users to add **all** their support material before going live. Add a "knowledge readiness" signal, a recommended-document checklist, per-document detail (chunk counts), and a warning when a business tries to install the widget with too little content.

## Why it matters

- The upload page allows many documents but never tells the user that **the AI can only answer from what they upload**.
- Users install the widget with one thin document, get poor answers, and blame the product.
- A readiness meter + recommendations sets expectations and drives better outcomes.

## Current state

- Upload works (PDF/TXT, multi-file) and polls status every 5s ([`Documents.tsx`](../../frontend/src/pages/dashboard/Documents.tsx)).
- There is a short static "What to upload" note, but no readiness signal, no recommendations, no per-document depth.
- Documents are chunked and embedded ([`documentProcessor.ts`](../../backend/src/services/documentProcessor.ts), [`chunker.ts`](../../backend/src/services/chunker.ts)); chunks live in `DocumentChunk` ([`schema.prisma`](../../backend/prisma/schema.prisma)) but their count is never surfaced.
- Listing endpoint returns id/name/status/createdAt only ([`document.controller.ts`](../../backend/src/controllers/document.controller.ts) `listDocuments`).

## Data model changes

None required. Everything can be derived from existing `Document` and `DocumentChunk` rows.

(Optional, for performance) denormalize a chunk count onto `Document`:

```prisma
model Document {
  // ...existing...
  chunkCount Int @default(0) // set after processing completes
}
```
If added, set it at the end of `processDocument` in [`documentProcessor.ts`](../../backend/src/services/documentProcessor.ts).

## Backend changes

- **Readiness/summary endpoint:** add `GET /api/documents/summary` in [`document.controller.ts`](../../backend/src/controllers/document.controller.ts) + [`document.routes.ts`](../../backend/src/routes/document.routes.ts) returning:
  - `totalDocuments`, counts by status (`READY`/`PROCESSING`/`FAILED`)
  - `totalChunks` (aggregate over `DocumentChunk` for the business)
  - a computed `readinessLevel` (e.g. `EMPTY` | `LOW` | `GOOD` | `STRONG`) based on ready docs + total chunks
- **Per-document chunk count:** include chunk counts in `listDocuments` (Prisma `_count` on the `chunks` relation, or the denormalized field). Surface `FAILED` clearly so users can re-upload.

Suggested readiness thresholds (tune later):

| Level | Rough rule |
|-------|-----------|
| EMPTY | 0 ready documents |
| LOW | 1 ready doc or < ~15 chunks |
| GOOD | 2+ ready docs and ~15-60 chunks |
| STRONG | 3+ ready docs and > ~60 chunks covering multiple topics |

## Frontend changes - [`Documents.tsx`](../../frontend/src/pages/dashboard/Documents.tsx)

- **Readiness meter** at the top: a labeled bar/segments (Empty -> Low -> Good -> Strong) with a one-line explanation and the current counts (docs ready, total chunks).
- **Recommended documents checklist:** cards/rows for common content types with a check when likely covered:
  - FAQs, Return/refund policy, Shipping info, Pricing/plans, Product/feature guides, Contact & hours, Troubleshooting.
  - Coverage detection can be heuristic (filename/keywords) or simply a manual checklist the user ticks - keep it simple; the point is to prompt them.
- **Per-document detail:** show chunk count and clearer status badges (reuse `Badge`); for `FAILED`, show a short reason hint and a re-upload affordance.
- **Install warning:** when readiness is `EMPTY`/`LOW`, show a banner ("Add more content for better answers") and surface the same warning on the Install page ([`EmbedCode.tsx`](../../frontend/src/components/EmbedCode.tsx)) before the user embeds.
- Keep the existing 5s polling so status/counts stay fresh during processing.

## Design notes

- Readiness meter should feel like a **progress goal**, not a scold - encourage, don't block. Installing is still allowed; the warning is advisory.
- Use color sparingly: amber for LOW/warnings, emerald for GOOD/STRONG, zinc for neutral.
- Recommended-docs cards: icon + title + short "why" + status (`Badge`), reuse `card` and `EmptyState` patterns.
- Reinforce the core message once, near the uploader: "Your AI can only answer from what you upload. Add all your support content for the best results."

## Acceptance criteria

- [ ] `GET /api/documents/summary` returns document counts by status, total chunks, and a readiness level.
- [ ] The Knowledge base page shows a readiness meter with live counts.
- [ ] Each document row shows its chunk count and a clear status badge; failed docs are obvious and re-uploadable.
- [ ] A recommended-content checklist is shown to guide what to upload.
- [ ] When content is low/empty, a warning appears on both the Knowledge base and Install pages.
- [ ] Messaging clearly states that answer quality depends on uploaded content.

## Out of scope

- Auto-generating knowledge from a website crawl (future idea).
- Editing/normalizing document text in-app.
- Enforcing a hard minimum before install (advisory only for now).
