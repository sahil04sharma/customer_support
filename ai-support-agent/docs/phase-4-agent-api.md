# Phase 4 — AI Agent Brain + Widget APIs

**Goal:** End-to-end AI Q&A over REST (no UI yet). A customer can start a conversation and get AI answers grounded in the business's documents, with automatic escalation when confidence is low.

## Prerequisites

- Phase 3 complete (vector search works).
- `GROQ_API_KEY` set in `.env`.

## Tasks

### 1. Agent service — `src/services/agent.ts`

Implement `runAgent()` from Section 6e of the spec:

- Input: `query`, `businessId`, `conversationHistory: { role, content }[]`.
- Steps:
  1. `relevantChunks = searchKnowledgeBase(query, businessId, 5)`.
  2. `topSimilarity = relevantChunks[0]?.similarity ?? 0`.
  3. Build `context` from chunks (`[Source i]: ...`).
  4. System prompt: answer using ONLY the context; if insufficient, reply exactly `"I need to connect you with a human agent who can better help you."`; never invent facts.
  5. Call Groq `llama-3.1-8b-instant`, messages = `[system, ...history.slice(-6), user]`, `max_tokens: 500`, `temperature: 0.3`.
  6. `needsEscalation = topSimilarity < threshold || answer.includes('human agent') || answer.includes('connect you with')`.
- Return `{ answer, confidence: topSimilarity, shouldEscalate, sources }`.
- **Threshold:** read `BusinessSettings.confidenceThreshold` for the business (default 0.7) instead of a hardcoded constant.

### 2. Conversation helpers — `src/services/conversation.service.ts`

- `startConversation(businessId, customer?)` → create `Conversation(OPEN)`.
- `appendMessage(conversationId, role, content, confidence?)` → create `Message`.
- `getHistory(conversationId)` → ordered messages mapped to `{ role, content }`.
- `markEscalated(conversationId)` → set `status = ESCALATED`, `handedOff = true`.

### 3. Widget routes — `src/routes/widget.routes.ts` (public, no JWT)

```
POST /api/widget/conversation/start
  body: { widgetKey, customerName?, customerEmail? }
  → look up Business by widgetKey (404 if none) → create conversation → return { conversationId, settings }

POST /api/widget/message
  body: { conversationId, content }
  → load conversation + businessId → save CUSTOMER message
  → history = getHistory() → runAgent(content, businessId, history)
  → save AI message (with confidence) → if shouldEscalate: markEscalated()
  → return { answer, confidence, shouldEscalate }
```

Validate bodies with zod. Scope all lookups via the conversation's `businessId`.

### 4. Business conversation routes (read-only) — `src/routes/conversation.routes.ts`

Protected by `requireBusiness`:

```
GET /api/conversations         # list this business's conversations
GET /api/conversations/:id      # one conversation + its messages (verify ownership)
```

Mount all new routers in `app.ts`.

## Acceptance criteria

- [ ] `POST /api/widget/conversation/start` with a valid `widgetKey` returns a `conversationId` and the business's widget settings.
- [ ] An invalid `widgetKey` returns 404.
- [ ] Asking a question answerable from the docs returns a grounded answer with `shouldEscalate: false`.
- [ ] Asking something not in the docs returns `shouldEscalate: true` and the conversation becomes `ESCALATED`.
- [ ] Messages (CUSTOMER + AI) are persisted with correct roles; AI messages store `confidence`.
- [ ] `GET /api/conversations/:id` returns the full message history for the owner business only.

## Verification (Postman/curl)

```bash
# start
curl -X POST http://localhost:5000/api/widget/conversation/start \
  -H "Content-Type: application/json" \
  -d '{"widgetKey":"<KEY>"}'

# message
curl -X POST http://localhost:5000/api/widget/message \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"<ID>","content":"What is your return policy?"}'
```
