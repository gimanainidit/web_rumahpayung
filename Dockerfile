# syntax=docker/dockerfile:1
# Node 24 (Debian bookworm) pinned by digest; linux/amd64 digest verified 2026-10-30.
ARG NODE_IMAGE=node:24-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c

FROM ${NODE_IMAGE} AS build
WORKDIR /build
# Cap the heap so the build stays modest on a small shared VPS.
ENV NODE_OPTIONS=--max-old-space-size=512
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src
COPY server ./server
COPY scripts ./scripts
COPY tests ./tests
COPY e2e ./e2e
COPY playwright.config.ts vitest.config.ts ./
RUN npm run build

FROM ${NODE_IMAGE} AS runtime
ARG RELEASE_SHA=unknown
LABEL org.opencontainers.image.revision=${RELEASE_SHA} \
      org.opencontainers.image.source=https://github.com/gimanainidit/web_rumahpayung
WORKDIR /app
ENV NODE_ENV=production
# tsx is a runtime dependency (server runs TypeScript via `node --import tsx`).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=build /build/dist ./dist
COPY server ./server
COPY scripts ./scripts
COPY src/domain.ts ./src/domain.ts
# Bind-mount target; host directory must be owned by uid 1000 (node).
RUN mkdir -p /app/.local && chown node:node /app/.local
USER node
EXPOSE 3000
CMD ["node", "--import", "tsx", "server/index.ts"]
