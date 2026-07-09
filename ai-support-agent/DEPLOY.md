# Deploy SupportDesk

Production setup: **Vercel** (dashboard) + **Railway** (API + widget) + managed services you already use locally.

```
Vercel (frontend)  ──REST/Socket.io──►  Railway (backend + widget.js)
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
              Supabase Postgres          Upstash Redis            Cloudinary
              (pgvector)                 (rate limits)            (uploads)
```

## Before you start

Have these ready (same as local dev):

| Service | What you need |
|---------|----------------|
| [Supabase](https://supabase.com) | Postgres project — enable **pgvector** in SQL: `CREATE EXTENSION IF NOT EXISTS vector;` |
| [Upstash](https://upstash.com) | Redis database → REST URL + token |
| [Groq](https://groq.com) | API key |
| [Google AI](https://ai.google.dev) | Gemini API key |
| [Cloudinary](https://cloudinary.com) | Cloud name, API key, secret |
| [Resend](https://resend.com) | *(optional)* API key + verified sender domain |

Generate three long random secrets (32+ chars each):

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ENCRYPTION_KEY`

---

## Step 1 — Push code to GitHub

Your repo: `https://github.com/sahil04sharma/customer_support`

```bash
git add .
git commit -m "Prepare for production deploy"
git push origin main
```

---

## Step 2 — Deploy backend (Railway)

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Select `customer_support`.
3. Open the service → **Settings** → **Root Directory** → set to:
   ```
   ai-support-agent
   ```
   > **Important:** Do not use `ai-support-agent/backend`. Railway only uploads the root directory — the widget folder must be included in the build.
4. **Settings → Networking** → **Generate Domain** (e.g. `your-api.up.railway.app`). Copy this URL.

### Environment variables

In Railway → **Variables**, add everything from `backend/.env.example`:

| Variable | Production value |
|----------|------------------|
| `DATABASE_URL` | Supabase **direct** connection (`db.xxx.supabase.co:5432`) |
| `GROQ_API_KEY` | Your Groq key |
| `GEMINI_API_KEY` | Your Gemini key |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token |
| `JWT_SECRET` | Long random string (32+ chars) |
| `JWT_REFRESH_SECRET` | Different long random string |
| `ENCRYPTION_KEY` | Different long random string (32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `NODE_ENV` | `production` |
| `TRUST_PROXY` | `true` |
| `CLIENT_URL` | Your Vercel URL (set after Step 3, then redeploy) |
| `ALLOWED_ORIGINS` | *(optional)* extra dashboard URLs, comma-separated |
| `RESEND_API_KEY` | *(optional)* |
| `EMAIL_FROM` | *(optional)* e.g. `SupportDesk <noreply@yourdomain.com>` |

> `PORT` is set automatically by Railway — do not override it.

5. Deploy. Railway runs:
   - Build widget → build backend → `prisma migrate deploy` → `npm start`
6. Verify: open `https://YOUR-RAILWAY-DOMAIN/health` → should return `{"status":"ok"}`.
7. Verify widget: `https://YOUR-RAILWAY-DOMAIN/widget.js` should load JavaScript.

---

## Step 3 — Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `customer_support`.
2. **Root Directory** → `ai-support-agent/frontend`
3. Framework: **Vite** (auto-detected)
4. **Environment Variables**:
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://YOUR-RAILWAY-DOMAIN` (no trailing slash) |
5. Deploy. Copy your Vercel URL (e.g. `https://customer-support.vercel.app`).

---

## Step 4 — Connect frontend ↔ backend

Back in **Railway** → update:

```
CLIENT_URL=https://YOUR-VERCEL-URL.vercel.app
```

If you use a custom domain on Vercel, set that instead. Redeploy the backend so CORS picks up the new origin.

---

## Step 5 — Production smoke test

1. Open your Vercel URL → register a business account.
2. Upload a PDF or TXT document → wait until status is **Ready**.
3. **Dashboard → Embed** → copy the snippet (should point to your Railway `widget.js`).
4. Paste the snippet into a local `test.html` page → open in browser → chat works.
5. Sign in at `/agent` → go online → test escalation flow.
6. Check **Overview** analytics update.

### Quick health checks

```bash
curl https://YOUR-RAILWAY-DOMAIN/health
curl -I https://YOUR-RAILWAY-DOMAIN/widget.js
```

---

## Custom domains (optional)

| Service | Domain example |
|---------|----------------|
| Vercel | `app.supportdesk.app` |
| Railway | `api.supportdesk.app` |

After adding domains:

1. Update `CLIENT_URL` on Railway to your Vercel custom domain.
2. Rebuild Vercel with `VITE_API_URL` pointing to your Railway custom domain.
3. Update widget embed snippets (dashboard always shows current `VITE_API_URL` at build time — redeploy Vercel after API URL changes).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error on login | `CLIENT_URL` must exactly match your Vercel URL (scheme + host, no trailing slash). |
| `widget.js` 404 | Widget build failed — check Railway build logs. Root directory must be `ai-support-agent` (not `backend`). |
| DB connection error | Use Supabase **direct** URL (port 5432), not the pooler, for `DATABASE_URL`. |
| Migrations fail | Run `CREATE EXTENSION IF NOT EXISTS vector;` in Supabase SQL editor first. |
| Rate limits not working | Confirm Upstash URL + token are set; redeploy. |
| Weak JWT warning in logs | Replace dev secrets with 32+ char random strings. |

---

## Cost estimate (free tier)

| Service | Free tier |
|---------|-----------|
| Railway | ~$5 credit/month (hobby) |
| Vercel | Free for hobby projects |
| Supabase | Free tier available |
| Upstash | Free tier available |
| Cloudinary | Free tier available |
