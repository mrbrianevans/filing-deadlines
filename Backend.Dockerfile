FROM node:19 AS builder

RUN corepack enable && corepack prepare pnpm@8.4.0 --activate && pnpm store path
WORKDIR /filing-deadlines
COPY pnpm-*.yaml ./
RUN pnpm fetch

COPY .dockerignore .dockerignore

COPY backend-shared backend-shared
COPY fs-shared fs-shared
COPY server server
COPY worker worker
COPY repl repl
RUN pnpm install --offline --frozen-lockfile --reporter=append-only


WORKDIR /filing-deadlines/worker
RUN pnpm run build
WORKDIR /filing-deadlines/repl
RUN pnpm run build
WORKDIR /filing-deadlines/server
RUN pnpm run build

FROM node:19-alpine

RUN corepack enable && corepack prepare pnpm@8.4.0 --activate && pnpm store path
WORKDIR /filing-deadlines
COPY pnpm-*.yaml ./
RUN pnpm fetch --prod

# only needs to copy the javascript files, but because there is no build dir, it copies everything.
COPY --from=builder /filing-deadlines/backend-shared backend-shared
COPY --from=builder /filing-deadlines/fs-shared fs-shared
COPY --from=builder /filing-deadlines/server server
COPY --from=builder /filing-deadlines/worker worker
COPY --from=builder /filing-deadlines/repl repl
RUN pnpm install --offline --frozen-lockfile --reporter=append-only --prod

# by default, it starts up a fastify server, but really this should be overriden
CMD ["node", "index.js"]
