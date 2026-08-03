FROM node:20-slim AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Default command runs the API server. Override the start command in your
# host's dashboard (or docker run) to `node dist/worker.js` for the worker
# service, and to `npx prisma migrate deploy && node dist/index.js` for the
# API service's first deploy so migrations run automatically.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
