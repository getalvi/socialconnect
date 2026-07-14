# SocialConnect AI — Deployment Guide

This guide walks you through deploying SocialConnect AI to production. After completing these steps, the entire application will be fully functional without requiring additional code.

## Prerequisites

- A GitHub account
- A Vercel account (free tier is fine)
- A Hugging Face account
- An OpenRouter API key (https://openrouter.ai)
- A PostgreSQL database (recommend: Neon, Supabase, or Railway free tier)
- A Redis instance (recommend: Upstash or Railway free tier)
- An n8n instance (n8n Cloud, or self-hosted via Docker)

---

## Step 1: Push the frontend to GitHub

1. Create a new repo at `https://github.com/new`
   - Name: `socialconnect`
   - Visibility: Private (recommended)
2. From your local clone:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SocialConnect AI"
   git branch -M main
   git remote add origin https://github.com/getalvi/socialconnect.git
   git push -u origin main
   ```

## Step 2: Deploy the backend to Hugging Face Spaces

1. Go to https://huggingface.co/new-space
   - Name: `socialconnect`
   - SDK: **Docker**
   - Visibility: **Private** (recommended — your backend should not be public)
2. Create the space
3. In the space, go to **Settings → Repository secrets** and add:
   - `OP_API_KEY` = your OpenRouter API key (REQUIRED)
   - `DATABASE_URL` = `postgresql+asyncpg://USER:PASS@HOST:5432/socialconnect`
   - `REDIS_URL` = `redis://default:PASS@HOST:6379`
   - `JWT_SECRET` = output of `python -c "import secrets; print(secrets.token_urlsafe(64))"`
   - `JWT_REFRESH_SECRET` = output of `python -c "import secrets; print(secrets.token_urlsafe(64))"`
   - `ENCRYPTION_KEY` = output of `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
   - `CORS_ORIGINS` = `https://socialconnect.vercel.app` (update after Step 3 with your real Vercel URL)
   - `ENVIRONMENT` = `production`
   - Optionally: `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, etc. for each platform you want to enable (see `backend/.env.example` for the full list)
4. Clone the HF Space repo locally:
   ```bash
   git clone https://huggingface.co/spaces/getalvi/socialconnect hf-space
   ```
5. Copy the `backend/` contents from this repo into the HF Space repo (at the root level, not inside a `backend/` subfolder — HF Spaces expects Dockerfile at root):
   ```bash
   cp -r backend/* hf-space/
   cp backend/.gitignore hf-space/  # if present
   ```
6. Commit and push:
   ```bash
   cd hf-space
   git add .
   git commit -m "Initial backend deploy"
   git push
   ```
7. Hugging Face will auto-build the Dockerfile. Watch the **Logs** tab in your space.
8. Once built, verify the health endpoint:
   ```bash
   curl https://getalvi-socialconnect.hf.space/health
   # Expected: {"status":"ok","version":"1.0.0","db":true,"redis":true,"ai":true,...}
   ```
9. Initialize the database (run schema.sql against your PostgreSQL):
   ```bash
   psql "$DATABASE_URL" -f backend/schema.sql
   ```
   Or use your DB provider's SQL editor to run the contents of `backend/schema.sql`.

## Step 3: Deploy the frontend to Vercel

1. Go to https://vercel.com/new
2. Import the `getalvi/socialconnect` GitHub repo
3. Vercel auto-detects Next.js — accept all defaults
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://getalvi-socialconnect.hf.space/api/v1`
5. Click **Deploy**
6. After deployment, copy your Vercel URL (e.g., `https://socialconnect.vercel.app`)
7. **Go back to HF Spaces** and update the `CORS_ORIGINS` secret to include your Vercel URL:
   - `CORS_ORIGINS` = `https://socialconnect.vercel.app,https://socialconnect-getalvi.vercel.app`
8. Restart the HF Space (Settings → Restart space)

## Step 4: Configure n8n workflows

1. In your n8n instance, go to **Workflows → Import from File**
2. Import each file from the `n8n-workflows/` directory
3. In n8n, go to **Settings → Variables** and add:
   - `SC_API_URL` = `https://getalvi-socialconnect.hf.space`
   - `SC_SERVICE_TOKEN` = a long-lived JWT (see below)
4. Activate each workflow

### Generating a service token for n8n

The simplest approach: register a service account via the API:

```bash
curl -X POST https://getalvi-socialconnect.hf.space/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"n8n@socialconnect.internal","password":"N8nServiceAccount123","name":"n8n Service"}'
```

The response includes `access_token` and `refresh_token`. Use `access_token` as `SC_SERVICE_TOKEN`. Note: access tokens expire in 15 minutes — for production, implement a refresh-rotation n8n workflow (deferred for v1).

## Step 5: Connect your social accounts

1. Visit `https://socialconnect.vercel.app` and sign in with the account you registered
2. Go to **Connected Accounts**
3. Click **Connect** next to each platform you want to enable
4. Complete the OAuth flow on each platform
5. Return to the dashboard — your accounts are now connected

## Step 6: Verify everything works

Run this checklist:

- [ ] `https://getalvi-socialconnect.hf.space/health` returns `{"status":"ok"}`
- [ ] `https://socialconnect.vercel.app` loads the dashboard
- [ ] You can register and log in
- [ ] AI Assistant page generates content (uses your OpenRouter key)
- [ ] Connected Accounts page shows real OAuth flow when you click Connect
- [ ] Calendar page shows scheduled posts
- [ ] Analytics page shows charts
- [ ] n8n workflows show "Active" status
- [ ] Trigger a test webhook to n8n — backend log shows the request

## Troubleshooting

### Backend won't start on HF Spaces
- Check **Logs** tab in your space
- Most common: missing secret. All secrets in `backend/.env.example` marked REQUIRED must be set.
- Verify `DATABASE_URL` uses `postgresql+asyncpg://` prefix (not just `postgresql://`)
- Verify `ENCRYPTION_KEY` is a valid Fernet key (44-char base64 string)

### CORS errors in browser console
- Update `CORS_ORIGINS` in HF Spaces secrets to include your exact Vercel URL
- Restart the space after changing secrets

### AI generation returns 503
- Verify `OP_API_KEY` is set in HF Spaces secrets
- Check backend logs for "openrouter_key_missing" warning
- Verify your OpenRouter account has credits

### OAuth flow fails
- Verify the platform's OAuth credentials are set in HF Spaces secrets (e.g., `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`)
- Verify `OAUTH_REDIRECT_BASE` in backend env matches your Vercel URL
- Check that the redirect URI registered on the platform matches: `https://socialconnect.vercel.app/oauth/callback/{platform}`

### Database connection fails
- Verify `DATABASE_URL` is reachable from HF Spaces (some DBs require IP allowlisting)
- Test locally: `psql "$DATABASE_URL" -c "SELECT 1"`

---

## Production Hardening Checklist (beyond v1)

These are NOT required for v1 deploy, but recommended before scaling:

- [ ] Enable Vercel DDoS protection (Pro plan)
- [ ] Add a CDN in front of HF Spaces (Cloudflare)
- [ ] Set up Sentry for error tracking
- [ ] Configure pgbouncer in front of PostgreSQL
- [ ] Add Stripe billing integration (schema fields exist, wiring deferred)
- [ ] Implement WebSocket for real-time notifications
- [ ] Add SAML/SSO for enterprise customers
- [ ] Set up daily DB backups
- [ ] Add Prometheus + Grafana monitoring
