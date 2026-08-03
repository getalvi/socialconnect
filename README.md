# FlowAI

A free, self-hostable workflow automation platform — visual editor, triggers
(webhook/schedule/manual), an HTTP action node, logic nodes, and a real
**AI Agent node** with Anthropic tool-use built in. Multi-tenant from the
ground up: every signup gets its own organization, and all data (workflows,
credentials, executions) is scoped to it.

This is a genuine working core, not a demo. It's intentionally not a
1:1 clone of every n8n integration — it's built so adding a new node is a
single file (see "Adding a new node" below).

## Architecture

```
frontend/   Next.js app (React Flow editor, auth, dashboard) → deploy to Vercel
backend/    Express API + execution engine + worker + scheduler → deploy to
            Railway / Render / Fly (needs to be an always-on process, NOT
            serverless — workflows need to listen for webhooks, run cron
            schedules, and execute potentially long AI agent calls)
```

Why not all-Vercel? Vercel functions are request/response and time-limited.
A workflow engine needs persistent processes: something listening for
webhooks 24/7, something firing cron schedules, something processing a job
queue. So: **Vercel hosts the UI**, a small always-on Node service hosts the
**engine**. Both sides can run entirely on free tiers.

Three backend processes run from the same codebase:
- `npm start` — the API server (also runs the scheduler loop in-process)
- `npm run worker` — the BullMQ worker that actually executes workflows
- Postgres — stores everything
- Redis — the job queue between "an execution was triggered" and "a worker ran it"

## Local development

**Prerequisites:** Node 20+, a Postgres database, a Redis instance (or
`docker run -p 6379:6379 redis` locally).

```bash
# Backend
cd backend
cp .env.example .env        # fill in DATABASE_URL, REDIS_URL, MASTER_KEY, JWT_SECRET
npm install
npm run prisma:dev          # creates tables
npm run dev                 # API on :4000
# in a second terminal:
npm run worker              # execution worker

# Frontend
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                 # UI on :3000
```

Generate the two required secrets:
```bash
openssl rand -base64 32   # → MASTER_KEY (credential encryption)
openssl rand -hex 32      # → JWT_SECRET
```

## Deploying for free

**1. Database (Postgres) — Railway or Supabase free tier**
Create a Postgres instance, copy its connection string.

**2. Queue (Redis) — Upstash free tier**
Create a Redis database, copy the `rediss://` connection string.

**3. Backend — Railway** (or Render/Fly)
- New project → Deploy from your GitHub repo → root directory `backend`
- It builds from the included `Dockerfile`
- Set env vars: `DATABASE_URL`, `REDIS_URL`, `MASTER_KEY`, `JWT_SECRET`, `FRONTEND_URL`
- This gives you the API service (its default start command runs migrations then the API)
- **Add a second service** from the same repo/image for the worker, but override its
  start command to `node dist/worker.js` — this is the process that actually
  executes workflows
- (Optional third service) same image, start command `node -e "require('./dist/scheduler/cron')"` —
  in the default setup the scheduler already runs inside the API process, so
  you only need this if you split it out for scale

**4. Frontend — Vercel**
- Import the repo, root directory `frontend`
- Env var: `NEXT_PUBLIC_API_URL` = your Railway backend's public URL
- Deploy

**5. First run**
- Visit your Vercel URL → Create an account (this creates your organization)
- Go to Credentials → add an Anthropic API key (needed for the AI Agent node)
- Create a workflow, drag in a trigger + the AI Agent node, connect them, Save, Test run

## Adding a new node

Every node is one file in `backend/src/engine/nodes/`. Copy `httpRequest.ts`
as a template, register it with `registerNode({...})`, add the filename to
the import list at the bottom of `backend/src/engine/nodeRegistry.ts`. It
shows up in the editor's palette automatically — no frontend changes needed
unless you want a bespoke params UI (the generic form covers most cases).

## Known limitations (honest list)

- **~10 nodes ship out of the box**, not n8n's 400+. The plugin system makes
  adding more mechanical, but you'll be writing them.
- **No "merge/wait for all inputs" node yet** — a node fires as soon as any
  single upstream branch reaches it. Fine for linear/branching workflows,
  not for fan-in patterns.
- **The Code node uses Node's built-in `vm` module**, which is a soft
  boundary, not a hardened sandbox. Fine for your own org running its own
  code; if you ever let untrusted third parties write Code-node scripts,
  move that execution into an isolated container/process instead.
- **Webhook auth is path-obscurity only** (same model n8n uses by default) —
  add a shared-secret header check per workflow if you need more.
- **No execution retry/backoff UI**, no node-level credentials-per-node caching,
  no visual diffing of past runs beyond the raw JSON log.

None of these are hard blockers — they're the next things to build, listed
so you know exactly what "production ready" means here today versus what
still needs hardening for your specific use.

## License

MIT — do whatever you want with it, including running it for other people
for free.
