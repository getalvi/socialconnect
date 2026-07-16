# SocialConnect AI

> The world's best AI Digital Marketing Employee — a real SaaS product, not a scheduler, not a demo.

SocialConnect AI is an AI-powered digital marketing platform that analyzes products, researches markets and trends, generates multilingual marketing content, enhances media, and publishes across 13+ social and commerce platforms with continuous self-improvement.

---

## What's in this repository

This is a **monorepo** containing three deployable components:

| Component | Tech | Deploy Target | Folder |
|-----------|------|---------------|--------|
| Frontend | Next.js 16, TypeScript, Tailwind 4, shadcn/ui | Vercel | `/` (root) |
| Backend | FastAPI, Python 3.11, async SQLAlchemy | Hugging Face Spaces | `/backend` |
| Automation | n8n workflows | Your n8n instance | `/n8n-workflows` |

---

## Architecture (one-line summary)

```
Browser → Vercel (Next.js) → HF Spaces (FastAPI) → PostgreSQL + Redis + OpenRouter → Social Platforms
                                          ↑
                                     n8n workflows
```

Full architecture in [`docs/02-architecture.md`](docs/02-architecture.md).

---

## Quick Start

### Prerequisites
- Node 20+ / Bun
- Python 3.11+
- PostgreSQL 16+ (or use the included docker-compose)
- Redis 7+
- An [OpenRouter](https://openrouter.ai) API key

### 1. Clone & install

```bash
git clone https://github.com/getalvi/socialconnect.git
cd socialconnect

# Frontend
bun install

# Backend
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Configure environment

```bash
# Frontend (root)
cp .env.example .env.local

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY, OP_API_KEY
```

Generate secrets:
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"   # JWT_SECRET
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"  # ENCRYPTION_KEY
```

### 3. Start the database

```bash
docker compose up -d postgres redis
```

### 4. Apply the database schema

```bash
psql postgresql://socialconnect:socialconnect_dev@localhost:5432/socialconnect -f backend/schema.sql
```

### 5. Run the backend

```bash
cd backend
uvicorn app.main:app --reload --port 7860
```

Visit http://localhost:7860/docs for Swagger.

### 6. Run the frontend

```bash
bun run dev
```

Visit http://localhost:3000.

---

## Deployment

### Frontend → Vercel

1. Push this repo to `https://github.com/getalvi/socialconnect`
2. In Vercel, **Add New Project** → import the repo
3. Vercel auto-detects Next.js 16
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://getalvi-socialconnect.hf.space/api/v1`
5. Deploy

### Backend → Hugging Face Spaces

1. Create a new Space at `https://huggingface.co/spaces/getalvi/socialconnect`
   - SDK: **Docker**
   - Visibility: Private (recommended)
2. Add Secrets (Settings → Repository secrets):
   - `OP_API_KEY` — your OpenRouter API key (REQUIRED)
   - `DATABASE_URL` — PostgreSQL connection string
   - `REDIS_URL` — Redis connection string
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`
   - All platform OAuth credentials you want to enable (see `backend/.env.example`)
3. Upload the contents of `backend/` to the Space repo (root level)
4. HF Spaces auto-builds the Dockerfile and serves on port 7860

### n8n Workflows

1. In your n8n instance, go to **Workflows → Import from File**
2. Import each `.json` from `/n8n-workflows/`
3. Configure n8n environment variables:
   - `SC_API_URL` = `https://getalvi-socialconnect.hf.space`
   - `SC_SERVICE_TOKEN` = a long-lived JWT (generate via the `/auth/login` endpoint with a service account)
4. Activate each workflow

See [`docs/deployment-guide.md`](docs/deployment-guide.md) for the full step-by-step.

---

## Project Structure

```
.
├── docs/                          # Requirements, architecture, deployment guide
├── backend/                       # FastAPI backend (deploys to HF Spaces)
│   ├── app/
│   │   ├── api/v1/endpoints/      # Route handlers
│   │   ├── core/                  # Config, security, logging, rate limit, audit
│   │   ├── db/                    # Async SQLAlchemy session
│   │   ├── models/                # ORM models
│   │   ├── schemas/               # Pydantic DTOs
│   │   ├── services/              # Business logic (auth, AI)
│   │   ├── ai/                    # OpenRouter client + prompt templates
│   │   ├── integrations/          # 13 platform OAuth clients
│   │   └── tests/                 # Pytest (38 tests, all passing)
│   ├── schema.sql                 # PostgreSQL schema (source of truth)
│   ├── Dockerfile                 # HF Spaces build
│   ├── requirements.txt
│   └── .env.example
├── n8n-workflows/                 # 5 production workflow JSON exports
├── prisma/                        # Frontend local SQLite cache schema
├── src/                           # Next.js frontend (deploys to Vercel)
│   ├── app/                       # App Router pages
│   ├── components/                # React components
│   └── lib/                       # API client, types, utils
├── docker-compose.yml             # Local full-stack dev
├── Dockerfile.frontend            # Frontend container (local dev only)
├── vercel.json                    # Vercel deploy config
└── README.md                      # This file
```

---

## Features

### AI Marketing (via OpenRouter)
- Caption generation (multiple variations)
- Hashtag generation (platform-specific)
- SEO title + meta description
- Product description
- CTA variants
- 30-day marketing strategy
- Trend research
- Keyword research (SEO)
- Audience analysis
- Competitor analysis
- Multilingual content adaptation
- Product image vision analysis
- Content variation generation

### Social Platform Integrations (real OAuth, not mock)
Facebook · Instagram · Threads · Twitter/X · Pinterest · LinkedIn · TikTok · Telegram · WhatsApp · WordPress · WooCommerce · Shopify · Google Business

Each implements: OAuth2 flow, token refresh, publish, analytics pull, encrypted token storage.

### Dashboard
- KPI dashboard with cross-platform analytics
- Campaign manager
- Media library
- Content calendar
- Analytics with charts
- AI assistant (interactive content generation)
- Connected accounts manager
- Notifications center
- User management (RBAC: Owner, Admin, Editor, Viewer)
- Settings (brand voice, defaults, AI config, notifications, API)
- Dark mode (default)
- Fully responsive

### Security
- JWT access (15min) + refresh (7d) with rotating tokens and family-based reuse detection
- RBAC enforced on every protected route
- Rate limiting (60/min anon, 600/min auth) via Redis token bucket
- Audit log (append-only)
- Fernet encryption at rest for OAuth tokens
- Pydantic strict validation (reject unknown fields)
- AI output sanitization (strips `<script>` tags and inline event handlers)
- CORS allowlist
- Prompt injection hardening (user content never concatenated into system prompt)
- `OP_API_KEY` never logged, never sent to frontend

### n8n Workflows
- Image analysis (webhook-triggered)
- Content generation (caption + hashtag + SEO in one flow)
- Publishing scheduler (cron-triggered, every minute)
- Analytics aggregator (every 6 hours, AI learns from patterns)
- Comment reply automation (sentiment-routed)

---

## Testing

### Backend
```bash
cd backend
pytest app/tests/ -v
# 38 tests, all passing
```

### Frontend
```bash
bun run lint    # ESLint clean
bun run build   # production build (optional)
```

---

## Tech Stack

**Frontend**: Next.js 16 · TypeScript 5 · Tailwind 4 · shadcn/ui · Framer Motion · TanStack Query · Zustand · Recharts · next-themes

**Backend**: FastAPI · Python 3.11 · SQLAlchemy 2.0 (async) · asyncpg · Pydantic v2 · bcrypt · PyJWT · cryptography (Fernet) · httpx · tenacity · structlog · arq (background queue) · redis

**Database**: PostgreSQL 16 (source of truth) · Redis 7 (rate limit + queue + cache) · SQLite via Prisma (frontend local cache only)

**AI**: OpenRouter (Anthropic Claude 3.5 Sonnet default, GPT-4o for vision)

**Deployment**: Vercel (frontend) · Hugging Face Spaces Docker (backend) · n8n Cloud or self-hosted

---

## Environment Variables Reference

See [`backend/.env.example`](backend/.env.example) and [`.env.example`](.env.example) for the complete list. Critical ones:

| Variable | Where | Purpose |
|----------|-------|---------|
| `OP_API_KEY` | HF Spaces secret | OpenRouter API key — never logged, never exposed to frontend |
| `DATABASE_URL` | HF Spaces secret | PostgreSQL async connection string |
| `REDIS_URL` | HF Spaces secret | Redis connection for rate limit + queue |
| `JWT_SECRET` | HF Spaces secret | Signs access tokens (min 32 bytes) |
| `JWT_REFRESH_SECRET` | HF Spaces secret | Signs refresh tokens (min 32 bytes) |
| `ENCRYPTION_KEY` | HF Spaces secret | Fernet key for OAuth token encryption at rest |
| `CORS_ORIGINS` | HF Spaces secret | Comma-separated frontend URLs |
| `NEXT_PUBLIC_API_URL` | Vercel env | Backend URL, exposed to browser |

---

## License

Proprietary. © 2026 SocialConnect AI.
