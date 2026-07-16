# SocialConnect AI — Requirements Analysis (Phase 1)

## 1. Product Vision

SocialConnect AI is an AI-powered Digital Marketing Employee delivered as a SaaS platform. It does not merely schedule posts — it functions as a human-equivalent Digital Marketing Expert that analyzes products, researches markets and trends, generates multilingual marketing content, enhances media, and publishes across 13+ social and commerce platforms with continuous self-improvement.

## 2. Target Users

| Persona | Description | Primary Need |
|---------|-------------|--------------|
| Solo founder / D2C brand owner | Runs a small Shopify/WooCommerce store | Generate and publish marketing content without hiring an agency |
| Marketing agency operator | Manages multiple client brands | Scale content production across clients and platforms |
| E-commerce manager | Responsible for a mid-market brand | Cross-platform publishing with market-aware copy |
| Content creator | Individual operating across TikTok/IG/X | Multilingual content generation and trend research |

## 3. Functional Requirements

### 3.1 Media Intake
- FR-1.1 Upload one or multiple images via drag-and-drop or file picker
- FR-1.2 Receive images automatically via webhook (n8n, Shopify, WooCommerce)
- FR-1.3 Store originals in media library with metadata (size, format, dimensions)

### 3.2 Product & Market Analysis
- FR-2.1 Recognize product category from image (vision model)
- FR-2.2 Infer target audience (demographics, interests)
- FR-2.3 Analyze competitors in same category
- FR-2.4 Analyze Bangladesh market (local trends, language, pricing context)
- FR-2.5 Analyze global market
- FR-2.6 Research current trends per platform
- FR-2.7 Research keywords (SEO + social)

### 3.3 Content Generation (AI via OpenRouter)
- FR-3.1 Generate marketing strategy document
- FR-3.2 Generate captions (multiple variations)
- FR-3.3 Generate hashtags (platform-specific limits)
- FR-3.4 Generate SEO title
- FR-3.5 Generate Meta description
- FR-3.6 Generate product description
- FR-3.7 Generate CTA variants
- FR-3.8 Generate multiple content variations per request
- FR-3.9 Generate multilingual content (Bangla, English, Arabic, Hindi, more)
- FR-3.10 Brand voice persistence (saved in settings)

### 3.4 Media Enhancement
- FR-4.1 Remove image backgrounds
- FR-4.2 Upscale images (2x)
- FR-4.3 Auto-resize per platform specs
- FR-4.4 Generate thumbnails
- FR-4.5 Apply branding overlay
- FR-4.6 Apply watermark

### 3.5 Social Platform Integrations (REAL OAuth, not mock)
- FR-5.1 Facebook (Pages)
- FR-5.2 Instagram (Business)
- FR-5.3 Threads
- FR-5.4 Twitter / X
- FR-5.5 Pinterest
- FR-5.6 LinkedIn (Pages + Profiles)
- FR-5.7 TikTok (Content Posting API)
- FR-5.8 Telegram (Channels)
- FR-5.9 WhatsApp Channel
- FR-5.10 WordPress (REST + Application Passwords)
- FR-5.11 WooCommerce (REST)
- FR-5.12 Shopify (Admin API)
- FR-5.13 Google Business Profile

Each integration must implement: OAuth2 flow, token refresh, publish, analytics pull.

### 3.6 Automation (n8n)
- FR-6.1 Image analysis workflow
- FR-6.2 Image enhancement workflow
- FR-6.3 Content generation workflow
- FR-6.4 SEO workflow
- FR-6.5 Hashtag workflow
- FR-6.6 Trend research workflow
- FR-6.7 Approval workflow
- FR-6.8 Scheduling workflow
- FR-6.9 Publishing workflow
- FR-6.10 Analytics aggregation workflow
- FR-6.11 Learning / performance feedback workflow
- FR-6.12 Comment reply workflow
- FR-6.13 DM automation workflow
- FR-6.14 Email automation workflow

### 3.7 Dashboard
- FR-7.1 Campaign manager (create, edit, archive)
- FR-7.2 Media library (grid, filter, search)
- FR-7.3 Calendar (month/week/day views)
- FR-7.4 Analytics (charts, KPIs)
- FR-7.5 AI Assistant chat
- FR-7.6 Notifications center
- FR-7.7 Connected accounts management
- FR-7.8 Settings (brand voice, API keys, preferences)
- FR-7.9 User management (RBAC: Owner, Admin, Editor, Viewer)
- FR-7.10 Dark mode + responsive design

## 4. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | API p95 < 500ms (excluding AI calls); AI generation streamed with progress |
| Availability | Health endpoint at `/health`; graceful degradation when AI provider is down |
| Security | JWT + refresh tokens, RBAC, rate limit (60 req/min anonymous, 600/min auth), input validation, output sanitization, audit log, no secret exposure |
| Compliance | OAuth scopes minimum-privilege; PII minimized; tokens encrypted at rest |
| Scalability | Stateless API workers; background jobs via Redis queue; horizontal scale |
| Observability | Structured logs (JSON), health check, error tracking |
| Internationalization | Multilingual content output; UI English-first |

## 5. Constraints

- AI provider: OpenRouter only (key in HF Spaces secret `OP_API_KEY`)
- Frontend must NEVER call OpenRouter directly
- Frontend deploy target: Vercel (repo `getalvi/socialconnect`)
- Backend deploy target: Hugging Face Spaces (space `getalvi/socialconnect`)
- No hardcoded secrets; all via environment variables

## 6. Out of Scope (v1)

- Mobile native apps (responsive web only)
- Paid subscription billing integration (Stripe) — schema prepared, wiring deferred
- Video generation
- Live-stream scheduling
- Team chat / collaboration real-time

## 7. Success Criteria

- Frontend builds and deploys to Vercel with zero manual code fixes
- Backend container builds and starts on Hugging Face Spaces
- `/health` returns 200 on backend
- OpenRouter AI generation returns valid response
- At least 3 OAuth flows (Facebook, Instagram, X) complete end-to-end
- Dashboard renders all primary pages without runtime errors
