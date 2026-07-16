# SocialConnect AI — Architecture Diagram

## High-Level Topology

```
                    ┌──────────────────────┐
                    │      User Browser     │
                    └──────────┬───────────┘
                               │ HTTPS
                    ┌──────────▼───────────┐
                    │  Frontend (Vercel)    │
                    │  Next.js 16 + TS      │
                    │  Tailwind + shadcn/ui │
                    └──────────┬───────────┘
                               │ REST + JSON
                    ┌──────────▼───────────┐
                    │  Backend (HF Spaces)  │
                    │  FastAPI + Python     │
                    │  JWT + RBAC + Rate    │
                    └──┬─────┬─────┬───────┘
                       │     │     │
              ┌────────▼┐ ┌──▼──┐ ┌▼──────────┐
              │PostgreSQL│ │Redis│ │OpenRouter │
              │(source)  │ │rl+q│ │(AI LLM)   │
              └─────────┘ └────┘ └───────────┘
                                               
                    ┌──────────────────────┐
                    │   n8n Workflows      │
                    │  (cloud or self)     │
                    └──────────┬───────────┘
                               │ authenticated REST
                               ▼
                          Backend API
                                               
                    ┌──────────────────────┐
                    │  Social Platforms    │
                    │  (OAuth2 + publish)  │
                    └──────────────────────┘
```

## Mermaid version

```mermaid
flowchart TB
    User[User Browser]
    FE[Frontend\nNext.js 16 on Vercel]
    BE[Backend\nFastAPI on HF Spaces]
    DB[(PostgreSQL\nSource of Truth)]
    Redis[(Redis\nRate Limit + Queue)]
    AI[OpenRouter\nClaude / GPT-4o]
    N8N[n8n Workflows]
    Social[Social Platforms\nFB, IG, X, LinkedIn, etc.]

    User -->|HTTPS| FE
    FE -->|REST + JSON| BE
    BE --> DB
    BE --> Redis
    BE -->|API Key from env| AI
    BE -->|OAuth2| Social
    N8N -->|Service JWT| BE
    Social -.->|webhooks| N8N

    style FE fill:#10b981,color:#fff
    style BE fill:#0ea5e9,color:#fff
    style AI fill:#8b5cf6,color:#fff
    style DB fill:#f59e0b,color:#fff
    style Redis fill:#ef4444,color:#fff
```

## Request Flow — Campaign Publish (Golden Path)

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as PostgreSQL
    participant AI as OpenRouter
    participant N8N as n8n
    participant Social as Social Platform

    U->>FE: Upload image
    FE->>BE: POST /media
    BE->>DB: INSERT media
    BE-->>FE: { media_id }

    U->>FE: Generate caption
    FE->>BE: POST /ai/generate { type: caption }
    BE->>AI: chat.completions (with OP_API_KEY)
    AI-->>BE: { content, usage }
    BE->>DB: INSERT ai_usage (audit)
    BE-->>FE: { content, variations }

    U->>FE: Approve & schedule
    FE->>BE: POST /posts + POST /schedules
    BE->>DB: INSERT post, schedule
    BE-->>FE: { post_id, schedule_id }

    N8N->>BE: GET /schedules?due=true (cron every 1 min)
    BE->>DB: SELECT due schedules
    BE-->>N8N: [schedules]

    N8N->>BE: POST /schedules/{id}/publish
    BE->>Social: POST /feed (with encrypted OAuth token)
    Social-->>BE: { external_id }
    BE->>DB: UPDATE schedule SET published_at
    BE-->>N8N: { success }

    N8N->>BE: POST /notifications
    BE->>DB: INSERT notification
    BE-->>FE: (next poll) notification
```

## Security Architecture

```mermaid
flowchart LR
    subgraph Frontend
        Browser[Browser]
        NextJS[Next.js]
    end

    subgraph Backend
        CORS[CORS Middleware]
        RateLimit[Rate Limit\nRedis token bucket]
        JWT[JWT Verify\naccess 15min]
        RBAC[RBAC Dependency\nowner>admin>editor>viewer]
        Audit[Audit Middleware\nappend-only log]
        Routes[Route Handler]
        Services[Service Layer]
        AIProxy[OpenRouter Client\nkey from env only]
    end

    subgraph Storage
        DB[(PostgreSQL)]
        Redis[(Redis)]
        AuditLog[(audit_log table)]
        EncryptedTokens[(oauth_tokens\nFernet encrypted)]
    end

    Browser -->|HTTPS| NextJS
    NextJS -->|Bearer JWT| CORS
    CORS --> RateLimit
    RateLimit --> JWT
    JWT --> RBAC
    RBAC --> Audit
    Audit --> Routes
    Routes --> Services
    Services --> DB
    Services --> AIProxy
    Services --> EncryptedTokens
    Audit --> AuditLog
    RateLimit --> Redis
```

## Deployment Topology

```
GitHub: getalvi/socialconnect
    │
    ├── push to main ──────────────────────┐
    │                                      │
    │                                      ▼
    │                              ┌───────────────┐
    │                              │    Vercel     │
    │                              │  (frontend)   │
    │                              │  socialconnect│
    │                              │  .vercel.app  │
    │                              └───────────────┘
    │
    └── backend/ folder ───────────────────┐
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │  HF Spaces      │
                                  │  (Docker)       │
                                  │  getalvi-       │
                                  │  socialconnect  │
                                  │  .hf.space      │
                                  │                 │
                                  │  OP_API_KEY ←   │
                                  │  HF Secret      │
                                  └─────────────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ External DB +   │
                                  │ Redis (Neon +   │
                                  │ Upstash)        │
                                  └─────────────────┘
```
