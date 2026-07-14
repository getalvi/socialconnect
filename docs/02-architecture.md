# SocialConnect AI — System Architecture (Phase 2)

## 1. High-Level Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                              │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND — Next.js 16 on Vercel                      │
│  App Router · TS · Tailwind · shadcn/ui · Framer Motion           │
│  Routes: / (landing) · /dashboard/* (auth-protected SaaS app)     │
│  Calls backend via NEXT_PUBLIC_API_URL                            │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTPS REST + JSON
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│         BACKEND — FastAPI on Hugging Face Spaces                  │
│  Python 3.11 · async · JWT (access + refresh) · RBAC              │
│  Rate limit · Audit log · Pydantic validation                     │
│  Endpoints: /auth /users /campaigns /media /posts /schedules      │
│             /analytics /ai /oauth /integrations /health           │
└─────────────────────────────────────────────────────────────────┘
        │                │                  │                │
        ▼                ▼                  ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐
│ PostgreSQL  │  │    Redis     │  │  OpenRouter  │  │  Social    │
│  (Prisma)   │  │ rate limit + │  │   (AI LLM)   │  │ Platforms  │
│             │  │  bg queue    │  │              │  │  (OAuth)   │
└─────────────┘  └──────────────┘  └──────────────┘  └────────────┘
                                                           ▲
                                                           │
                                                  ┌────────────────┐
                                                  │   n8n (cloud)  │
                                                  │  workflows     │
                                                  └────────────────┘
                                                           ▲
                                                           │
                                                  ┌────────────────┐
                                                  │ Webhooks from  │
                                                  │ Shopify/Woo/   │
                                                  │ social         │
                                                  └────────────────┘
```

## 2. Component Responsibilities

### 2.1 Frontend (Next.js)
- **Role**: Presentation, client-side state, optimistic UI
- **Auth**: NextAuth credentials provider calling backend `/auth/login`
- **State**: Zustand (UI), TanStack Query (server cache)
- **Styling**: Tailwind 4 + shadcn/ui New York, dark mode via `next-themes`
- **Routing**: App Router; `(auth)` group for login/register, `(dashboard)` group for app
- **API client**: typed wrapper around `fetch` with auto refresh on 401
- **NEVER** calls OpenRouter directly

### 2.2 Backend (FastAPI)
- **Role**: Business logic, security, AI orchestration, OAuth broker
- **Entry**: `backend/app/main.py` → ASGI app served by Uvicorn
- **Layering**:
  ```
  app/
    api/v1/endpoints/   # route handlers (thin)
    core/               # config, security, logging, rate limit
    db/                 # async SQLAlchemy session, base model
    models/             # ORM models
    schemas/            # Pydantic request/response DTOs
    services/           # business logic (thick)
    integrations/       # social platform OAuth clients
    ai/                 # OpenRouter client + prompt templates
    workers/            # background tasks (RQ / arq)
    tests/              # pytest
  ```
- **Security middleware**: CORS, trusted hosts, rate limit (Redis), request ID, audit log
- **Auth**: JWT access (15min) + refresh (7d, rotating), stored hashed in DB
- **RBAC**: `Owner > Admin > Editor > Viewer` enforced via dependency

### 2.3 Database (PostgreSQL)
- **Connection**: async via `asyncpg` + SQLAlchemy 2.0
- **Migrations**: Alembic
- **Schema**: see Phase 3 doc
- **Pool**: 10 min / 20 max connections

### 2.4 Redis
- **Rate limiting**: token bucket per user + per IP
- **Background queue**: `arq` workers for publishing, analytics pulls
- **Cache**: trend data, keyword research (TTL 1h)

### 2.5 AI Layer (OpenRouter)
- **Client**: `app/ai/openrouter.py` — async `httpx` wrapper
- **Auth**: `os.getenv("OP_API_KEY")` only — never logged, never sent to client
- **Models**: default `anthropic/claude-3.5-sonnet` (configurable), vision via `openai/gpt-4o`
- **Prompts**: versioned templates in `app/ai/prompts/`
- **Streaming**: SSE for long generations
- **Cost guard**: per-organization daily token budget

### 2.6 n8n
- **Role**: External automation orchestration (webhook-triggered workflows)
- **Connection**: n8n calls backend REST endpoints with service account JWT
- **Workflows**: 14 production workflows (see Phase 7)
- **Secrets**: stored in n8n credentials vault, not in backend

### 2.7 Social Platform Integrations
- **Pattern**: each platform implements `IntegrationClient` interface
  ```python
  class IntegrationClient:
      async def authorize_url(state: str) -> str
      async def exchange_code(code: str) -> TokenSet
      async def refresh_token(refresh: str) -> TokenSet
      async def publish(post: PostPayload) -> PublishResult
      async def fetch_analytics(post_id: str) -> Analytics
  ```
- **Token storage**: encrypted at rest (Fernet), per-organization
- **Token refresh**: background worker refreshes tokens expiring within 24h

## 3. Data Flow — Campaign Publish (Golden Path)

1. User uploads image → `POST /media` (presigned URL pattern)
2. User creates campaign → `POST /campaigns`
3. User triggers AI generate → `POST /ai/generate` → backend calls OpenRouter → returns content pack
4. User edits + approves → `POST /posts` (status=draft)
5. User schedules → `POST /schedules` (status=scheduled, cron computed)
6. Background worker fires at scheduled time → publishes to each connected platform
7. Worker pulls analytics 1h, 24h, 7d after publish
8. Aggregated analytics surface in dashboard

## 4. Security Architecture

| Layer | Control |
|-------|---------|
| Transport | HTTPS enforced; HSTS on Vercel + HF Spaces |
| Auth | JWT HS256, rotating refresh tokens, revocation list |
| Authz | RBAC dependency on every protected route |
| Input | Pydantic strict; length limits; reject unknown fields |
| Output | Sanitize AI output before persisting (strip script tags) |
| Secrets | `.env` only; `OP_API_KEY` from HF Spaces secret; never logged |
| Rate limit | Redis token bucket; 429 with Retry-After |
| Audit | Append-only `audit_log` table; user, action, ip, ts, metadata |
| CORS | Allowlist `VERCEL_PROJECT_DOMAIN` + localhost dev |
| CSRF | SameSite=Strict cookies for auth; bearer token for API |
| Prompt injection | System prompt hardening + output validation schema |
| Token leakage | Tokens never returned to frontend; only `is_connected` boolean |

## 5. Deployment Topology

```
GitHub repo: getalvi/socialconnect
    │
    ├─ push to main → Vercel auto-deploy (frontend)
    │
    └─ backend/ folder → manually sync to HF Spaces repo
                          → HF builds Dockerfile
                          → Space starts on port 7860
                          → OP_API_KEY injected from Space secret
```

### Frontend env (Vercel)
```
NEXT_PUBLIC_API_URL=https://getalvi-socialconnect.hf.space
NEXTAUTH_URL=https://socialconnect.vercel.app
NEXTAUTH_SECRET=<generated>
```

### Backend env (HF Spaces)
```
OP_API_KEY=<from Space secret>
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<generated>
JWT_REFRESH_SECRET=<generated>
ENCRYPTION_KEY=<generated>  # Fernet, for OAuth tokens
CORS_ORIGINS=https://socialconnect.vercel.app
ENVIRONMENT=production
```

## 6. Scalability Strategy

- **Stateless API**: any worker can serve any request; scale horizontally
- **Background jobs**: Redis queue + `arq` workers (separate process)
- **DB pooling**: pgbouncer in transaction mode for production
- **AI calls**: streaming + per-org concurrency limit (default 3)
- **CDN**: Vercel edge for frontend static; HF Spaces for backend (single region)

## 7. Observability

- **Logs**: JSON structured (`structlog`), key fields: `request_id`, `user_id`, `org_id`, `action`, `ms`
- **Health**: `GET /health` returns `{ status, db, redis, ai, version }`
- **Metrics**: `/metrics` Prometheus endpoint (deferred — placeholder route)
- **Error tracking**: structured log of all 5xx with stack trace

## 8. Tech Decisions Rationale

| Decision | Why |
|----------|-----|
| FastAPI over Django | Async-first, OpenAPI built-in, lighter weight, matches Next.js TS ergonomics |
| SQLAlchemy 2.0 over Tortoise | Mature, async support, Alembic migrations, team familiarity |
| `arq` over Celery | Async-native, Redis-only, simpler ops, no broker |
| NextAuth credentials provider | Backend owns auth source of truth; no provider lock-in |
| Separate frontend/backend repos | Different deploy targets, different CI/CD |
| Prisma on frontend | Local SQLite cache for non-critical UI state (preferences, drafts) — NOT source of truth |
| PostgreSQL for backend | ACID, JSONB for AI outputs, mature ops |

## 9. Phase Sequencing (Build Order)

Phases 3 → 10 in order. Each phase ships runnable artifacts. Phase 9 (testing) runs continuously against the current phase's output. Phase 10 (deployment) wires everything for the two deploy targets.
