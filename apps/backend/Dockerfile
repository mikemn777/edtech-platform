# syntax=docker/dockerfile:1
# Multi-stage build for the NestJS backend (Implementation Blueprint §15, §30).

# ---------- base ----------
FROM node:20.11.0-alpine AS base
RUN corepack enable && apk add --no-cache libc6-compat
WORKDIR /repo
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# ---------- deps ----------
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/backend/package.json apps/backend/
COPY packages/types/package.json packages/types/
COPY packages/localization/package.json packages/localization/
RUN pnpm install --frozen-lockfile || pnpm install

# ---------- development ----------
FROM deps AS development
COPY . .
RUN pnpm --filter @edu/backend db:generate
WORKDIR /repo/apps/backend
EXPOSE 4000
CMD ["pnpm", "dev"]

# ---------- build ----------
FROM deps AS build
COPY . .
RUN pnpm --filter @edu/backend db:generate \
 && pnpm --filter @edu/backend build

# ---------- production ----------
FROM node:20.11.0-alpine AS production
RUN corepack enable && apk add --no-cache libc6-compat
WORKDIR /repo
ENV NODE_ENV=production
# Run as non-root (security — Blueprint §17)
RUN addgroup -S edu && adduser -S edu -G edu
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/backend/dist ./apps/backend/dist
COPY --from=build /repo/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /repo/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /repo/apps/backend/package.json ./apps/backend/package.json
USER edu
WORKDIR /repo/apps/backend
EXPOSE 4000
CMD ["node", "dist/main.js"]
