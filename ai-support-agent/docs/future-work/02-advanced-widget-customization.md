# 02 - Advanced Widget Customization

## Goal

Let a business make the chat widget feel like **their own product**: upload a custom launcher image/logo and agent avatar, change the bubble shape and size, pick a theme, add quick-reply buttons, and edit more copy - all with a **live preview** in the dashboard so they see changes before publishing.

## Why it matters

- Today the widget only supports a color, a position, a welcome message, and an assistant name. It looks generic.
- Businesses expect their support widget to match their brand (logo, rounded/square styles, light/dark).
- A live preview removes guesswork and makes the product feel professional and trustworthy.

## Current state

- Editable fields are only `widgetColor`, `widgetPosition`, `welcomeMessage`, `agentName`, `confidenceThreshold`:
  - Model: [`schema.prisma`](../../backend/prisma/schema.prisma) `BusinessSettings`.
  - Editor UI: [`Settings.tsx`](../../frontend/src/pages/dashboard/Settings.tsx).
  - Settings are returned to the widget on conversation start ([`widget.controller.ts`](../../backend/src/controllers/widget.controller.ts)).
- The widget renders a fixed emoji bubble and applies only color + position:
  - [`Widget.tsx`](../../widget/src/Widget.tsx) (bubble shows `💬`, uses `widgetColor` and `positionClass`).
  - [`ChatWindow.tsx`](../../widget/src/ChatWindow.tsx) (header uses `agentName` + `widgetColor`).
  - [`widget.css`](../../widget/src/widget.css) (fixed 360x480 window, round bubble).
- Image upload infra already exists for documents via Cloudinary ([`cloudinary.ts`](../../backend/src/lib/cloudinary.ts)) and Multer ([`document.controller.ts`](../../backend/src/controllers/document.controller.ts)).

## Data model changes

Extend `BusinessSettings` in [`schema.prisma`](../../backend/prisma/schema.prisma):

```prisma
model BusinessSettings {
  id                  String   @id @default(cuid())
  businessId          String   @unique
  widgetColor         String   @default("#1a56db")
  widgetPosition      String   @default("bottom-right")
  welcomeMessage      String   @default("Hi! How can I help you today?")
  agentName           String   @default("Support Assistant")
  confidenceThreshold Float    @default(0.7)

  // New customization fields
  launcherImageUrl    String?  // custom bubble image/logo (Cloudinary URL)
  avatarImageUrl      String?  // assistant avatar in the header/messages
  bubbleShape         String   @default("round")   // round | rounded | square
  bubbleSize          String   @default("medium")  // small | medium | large
  themeMode           String   @default("light")   // light | dark
  headerTitle         String?  // overrides agentName in the header if set
  launcherText        String?  // optional label next to the bubble
  offlineMessage      String   @default("We're offline right now, but leave a message!")
  showBranding        Boolean  @default(true)      // "Powered by SupportDesk"
  quickReplies        String[] @default([])         // suggested first questions

  business            Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}
```

Apply with `npx prisma db push`. Update the Zod schema in `backend/src/validation/business.schema.ts` (`updateSettingsSchema`) to accept and validate all new fields (enums for shape/size/theme, URL checks, array length caps, string length caps).

## Backend changes

- **Image upload endpoint:** add `POST /api/business/widget-image` (auth required) in [`business.controller.ts`](../../backend/src/controllers/business.controller.ts) + [`business.routes.ts`](../../backend/src/routes/business.routes.ts). Reuse the Multer memory-storage + Cloudinary pattern from [`document.controller.ts`](../../backend/src/controllers/document.controller.ts); restrict to image MIME types (`image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`) and a small size limit (e.g. 1 MB). Return the hosted URL; the frontend stores it into the relevant `*ImageUrl` field via the normal settings save.
- **Return new fields:** `startWidgetConversation` already returns `business.settings`; confirm all new fields are included ([`widget.controller.ts`](../../backend/src/controllers/widget.controller.ts)). No shape change needed if it returns the whole settings object.
- Keep defaults sensible so existing widgets keep working with no settings changes.

## Frontend changes

### Dashboard editor - [`Settings.tsx`](../../frontend/src/pages/dashboard/Settings.tsx)

- Redesign into a **two-column layout**: left = form controls (grouped into "Brand", "Launcher", "Theme", "Messages", "Quick replies"), right = **live preview** pinned/sticky.
- Add controls: image uploaders (launcher, avatar) with preview + remove, shape selector, size selector, theme toggle, header title, launcher text, offline message, quick-reply list editor (add/remove chips), branding toggle.
- Live preview: render a lightweight mock of the bubble + open chat window using the current form state (does not need the real widget bundle; a styled React mock is fine). Reflect color, shape, size, theme, images, title, quick replies.
- Add theme **presets** (e.g. "Minimal light", "Bold dark", "Rounded brand") that set several fields at once.

### Widget renderer

- [`Widget.tsx`](../../widget/src/Widget.tsx): render `launcherImageUrl` inside the bubble when present (fallback to current emoji); apply `bubbleShape`, `bubbleSize`, and `launcherText`.
- [`ChatWindow.tsx`](../../widget/src/ChatWindow.tsx): use `headerTitle ?? agentName`, show `avatarImageUrl`, render `quickReplies` as tappable chips on first open (clicking sends that text), honor `themeMode`, show `showBranding` footer.
- [`widget.css`](../../widget/src/widget.css): add classes for shapes (`round`/`rounded`/`square`), sizes, and a dark theme variant. Keep the injected-CSS approach.
- Extend the widget settings type in [`widget/src/lib/api.ts`](../../widget/src/lib/api.ts) (`WidgetSettings`) with the new fields.
- After changes, rebuild: `cd widget && npm run build`.

## Design notes

- **Live preview is the centerpiece** - it should update instantly as the user edits. This is what makes it feel professional.
- Provide **image guidance** inline: recommended size (e.g. 64x64 launcher, square avatar), supported formats, and graceful fallback if no image.
- Shapes: `round` (circle), `rounded` (squircle), `square` (subtle radius). Sizes map to concrete px values in CSS.
- Dark theme must keep good contrast for text bubbles and input.
- Keep the editor calm: group fields under small section headers, use existing `label`, `input-field`, `card`, `btn-primary` classes.
- Quick replies: show as chips in the editor and preview; cap the count (e.g. max 5) and length.

## Acceptance criteria

- [ ] `BusinessSettings` stores all new fields with safe defaults; existing widgets keep working unchanged.
- [ ] A business can upload a launcher image and an avatar; images are hosted on Cloudinary and shown in the widget.
- [ ] Bubble shape and size options visibly change the rendered widget.
- [ ] Light/dark theme both render with good contrast.
- [ ] Quick replies appear in the widget and send the chosen text when tapped.
- [ ] The Settings page shows a live preview that updates as fields change.
- [ ] `npm run build` in `widget/` produces an updated `widget.js` that honors the new settings.

## Out of scope

- Fully custom CSS injection by tenants (security risk) - offer curated options only.
- Multi-language widget copy (see [05](05-additional-features-backlog.md)).
- Per-page or per-URL widget targeting rules.
