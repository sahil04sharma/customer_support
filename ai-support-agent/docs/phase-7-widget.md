# Phase 7 — Embeddable Widget

**Goal:** A single `widget.js` file a business pastes on any website to get a live AI chat bubble.

## Prerequisites

- Phases 1–5 complete (widget APIs + sockets work).

## Tasks

### 1. Scaffold the widget — `widget/`

- Separate Vite + React + TypeScript project.
- `vite.config.ts` builds to a single self-contained IIFE/UMD bundle named `widget.js` (inline CSS, no external deps at runtime). Example:

```ts
// widget/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.ts', name: 'SupportWidget', formats: ['iife'], fileName: () => 'widget.js' },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
```

### 2. Entry — `widget/src/index.ts`

- Read `data-widget-key` from the currently executing `<script>` tag.
- Create a container element, mount the React `Widget` into it.

### 3. Components

- `Widget.tsx` — floating bubble + open/close state; on first open calls `POST /api/widget/conversation/start` with the `widgetKey`, then applies returned settings (color, position, welcome message, agent name).
- `ChatWindow.tsx` — message list, input box, typing indicator.

### 4. Realtime integration

- Connect Socket.io with the `conversationId`.
- Emit `join_conversation`, `customer_message`.
- Handle `ai_typing`, `ai_response`, `escalated_to_human`, `agent_joined`, `agent_response`, `conversation_resolved`.

### 5. Test harness — `widget/test.html`

```html
<!doctype html>
<html>
  <body>
    <h1>Test site</h1>
    <script src="http://localhost:xxxx/widget.js" data-widget-key="<KEY>"></script>
  </body>
</html>
```

## Acceptance criteria

- [ ] `npm run build` in `widget/` produces a single `widget.js`.
- [ ] Pasting the script tag on a plain HTML page renders a chat bubble.
- [ ] The widget reads `data-widget-key` and starts a conversation.
- [ ] Customer can chat with AI; typing indicator works.
- [ ] On escalation, the customer sees the handoff and can talk to a human agent live.
- [ ] Widget styling respects the business's configured color/position.

## Verification

```bash
cd widget
npm install
npm run build
# serve the built file + test.html (e.g. `npx serve .`) and open test.html
```
