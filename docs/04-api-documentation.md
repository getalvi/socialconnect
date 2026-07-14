# SocialConnect AI — API Documentation

Base URL: `https://getalvi-socialconnect.hf.space/api/v1`
Swagger UI: `https://getalvi-socialconnect.hf.space/docs`
OpenAPI spec: `https://getalvi-socialconnect.hf.space/openapi.json`

## Authentication

All protected endpoints require a Bearer JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Access tokens expire in 15 minutes. Refresh tokens expire in 7 days and rotate on each use (family-based reuse detection).

### POST /auth/register
Create a new user + personal organization.

**Request body**
```json
{ "email": "alvi@example.com", "password": "StrongPass1", "name": "Alvi" }
```
Password requirements: min 8 chars, at least 1 uppercase, 1 digit.

**Response 201**
```json
{ "access_token": "...", "refresh_token": "...", "token_type": "bearer", "expires_in": 900 }
```

### POST /auth/login
```json
{ "email": "alvi@example.com", "password": "StrongPass1" }
```
**Response 200**: same as register.

### POST /auth/refresh
```json
{ "refresh_token": "..." }
```
**Response 200**: new access + refresh tokens. Old refresh token is revoked.

### POST /auth/logout
Revokes a single refresh token. Body: `{ "refresh_token": "..." }`

### GET /auth/me
Returns current user. Requires Bearer token.

---

## AI

### POST /ai/generate
Generate marketing content via OpenRouter. Frontend NEVER calls OpenRouter directly.

**Request body**
```json
{
  "request_type": "caption",
  "prompt": "Handwoven jute tote bag, eco-friendly, made in Bangladesh",
  "context": { "platform": "instagram", "brand_voice": { "tone": "professional" } },
  "language": "en",
  "variations": 3,
  "model": "anthropic/claude-3.5-sonnet"
}
```

`request_type` values: `caption`, `hashtags`, `seo_title`, `meta_description`, `product_description`, `cta`, `strategy`, `trend_research`, `keyword_research`, `audience_analysis`, `competitor_analysis`, `multilingual`, `content_variations`

**Response 200**
```json
{
  "request_type": "caption",
  "content": "Carry the planet's story on your shoulder. 🌿\n\n...",
  "variations": ["variation 1", "variation 2", "variation 3"],
  "metadata": { "model": "anthropic/claude-3.5-sonnet", "prompt_tokens": 142, "completion_tokens": 387 },
  "tokens_used": 529
}
```

### POST /ai/analyze-image
Analyze a product image using vision model.

**Request body**
```json
{ "image_url": "https://...", "question": "Describe this product for marketing" }
```

---

## Campaigns

### GET /campaigns
List campaigns in the current organization.

### POST /campaigns
Create a campaign. Requires `editor` role or higher.
```json
{
  "name": "Summer Collection Launch",
  "description": "Q3 2026 campaign",
  "start_date": "2026-07-01T00:00:00Z",
  "end_date": "2026-07-31T23:59:59Z",
  "budget": 5000,
  "platforms": ["instagram", "facebook", "tiktok"]
}
```

### GET /campaigns/{id}
### PATCH /campaigns/{id}
### DELETE /campaigns/{id} (soft delete, requires `admin`)

---

## Posts

### GET /posts?status=draft
### POST /posts
### GET /posts/{id}
### DELETE /posts/{id}
### POST /posts/{id}/approve (marks post as approved, requires `editor`)

---

## Schedules

### GET /schedules
### POST /schedules
```json
{ "post_id": "...", "platform": "instagram", "scheduled_for": "2026-07-14T18:00:00Z", "timezone": "UTC" }
```
### DELETE /schedules/{id} (fails if already published)

---

## OAuth (Connected Accounts)

### GET /oauth/authorize/{platform}
Returns the OAuth authorize URL for the given platform.
```json
{ "platform": "facebook", "authorize_url": "https://www.facebook.com/v20.0/dialog/oauth?...", "state": "user-id:org-id:nonce" }
```

### POST /oauth/callback
Exchange OAuth code for access token. Token is encrypted at rest.
```json
{ "platform": "facebook", "code": "...", "state": "..." }
```

### GET /oauth/accounts
List connected accounts. Returns `is_connected: true` — never returns the actual tokens.

### DELETE /oauth/disconnect/{platform}
Removes the stored token for this platform.

---

## Media

### GET /media?limit=50&offset=0
### POST /media
### DELETE /media/{id}

---

## Analytics

### GET /analytics/summary?days=30
```json
{ "days": 30, "impressions": 619000, "reach": 412000, "likes": 42400, "comments": 8100, "shares": 3900, "clicks": 21500 }
```

### GET /analytics/by-platform?days=30

---

## Notifications

### GET /notifications?unread_only=true
### POST /notifications/{id}/read

---

## Settings

### GET /settings
### PATCH /settings

---

## Users

### GET /users/me
Returns current user + active organization.

---

## Health

### GET /health (no auth)
```json
{ "status": "ok", "version": "1.0.0", "db": true, "redis": true, "ai": true, "timestamp": "..." }
```

---

## Rate Limits

| Endpoint class | Limit |
|----------------|-------|
| Anonymous | 60 req/min per IP |
| Authenticated | 600 req/min per user |

When exceeded, returns `429 Too Many Requests` with `Retry-After` header.

---

## RBAC Roles

| Role | Permissions |
|------|-------------|
| Owner | Full access, billing, delete organization |
| Admin | Manage users, all content |
| Editor | Create/edit/publish content |
| Viewer | Read-only |

---

## Error Format

All errors return:
```json
{ "detail": "Human-readable message" }
```

With appropriate HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500, 502, 503).
