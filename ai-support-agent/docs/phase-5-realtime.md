# Phase 5 — Real-time Chat & Human Escalation

**Goal:** Socket.io live chat between customer and AI, with seamless handoff to a human agent when the AI escalates.

## Prerequisites

- Phase 4 complete (AI agent + widget REST APIs work).

## Tasks

### 1. Socket setup — `src/socket/socketHandler.ts`

- Attach Socket.io to the HTTP server created in `server.ts` (configure CORS for widget + dashboard origins).
- Rooms:
  - One room per conversation: `conversation:<conversationId>`.
  - One room per business for its agents: `business:<businessId>`.
- Export `initSocket(httpServer)` and call it from `server.ts`. Keep a reference (e.g. exported `io`) so REST handlers can emit if needed.

### 2. Events (match the spec exactly — Section 8)

Customer side:
- `join_conversation` `{ conversationId }` → join room, server replies `conversation_joined` `{ conversationId, history }`.
- `customer_message` `{ conversationId, content }` →
  - save CUSTOMER message,
  - emit `ai_typing` `{ conversationId }` to the customer,
  - run `runAgent(...)`,
  - save AI message, emit `ai_response` `{ conversationId, message }`,
  - if escalate: emit `escalated_to_human` `{ conversationId }` to customer **and** `new_escalation` `{ conversationId }` to `business:<businessId>` (online agents).

Agent side:
- `agent_online` `{ agentId, businessId }` → join `business:<businessId>`, set `Agent.isOnline = true`, store presence in Redis (`redisKeys.agentPresence`), emit `agent_status_updated`.
- `accept_conversation` `{ conversationId, agentId }` → assign `agentId` to conversation, join the conversation room, emit `agent_joined` `{ agentId, agentName }` to the customer.
- `agent_message` `{ conversationId, content }` → save AGENT message, emit `agent_response` `{ conversationId, message }` to customer.
- `resolve_conversation` `{ conversationId }` → set `status = RESOLVED`, emit `conversation_resolved` `{ conversationId }`.
- On disconnect: set `isOnline = false`, clear presence.

### 3. Agent REST routes — `src/routes/agent.routes.ts`

Protected by `requireAgent`:

```
GET /api/agent/conversations              # ESCALATED convos for my business (unassigned or assigned to me)
POST /api/agent/message                    # send a message (also broadcast via socket)
PUT /api/agent/conversations/:id/resolve   # resolve
```

### 4. Wire the widget message path

- Prefer the socket path for live customer messages going forward.
- Keep the Phase 4 REST `POST /api/widget/message` working as a fallback for testing.

## Acceptance criteria

- [ ] A customer socket can `join_conversation` and receives history.
- [ ] `customer_message` triggers `ai_typing` then `ai_response`.
- [ ] A low-confidence answer emits `escalated_to_human` to the customer and `new_escalation` to online agents of that business only.
- [ ] An agent can `accept_conversation`; the customer receives `agent_joined`.
- [ ] `agent_message` reaches the customer as `agent_response`.
- [ ] `resolve_conversation` sets status `RESOLVED` and notifies the customer.
- [ ] Agent presence (`isOnline`) updates on connect/disconnect.

## Verification

Use a Socket.io test client (e.g. a small Node script or Postman's Socket.io support):
1. Connect as customer, `join_conversation`, send `customer_message`, observe AI events.
2. Force escalation (ask an off-topic question), connect a second client as agent (`agent_online`), observe `new_escalation`.
3. `accept_conversation`, exchange `agent_message` / `agent_response`, then `resolve_conversation`.
