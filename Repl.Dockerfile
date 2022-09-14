FROM node:18

RUN corepack enable && corepack prepare pnpm@7.11.0 --activate && pnpm config set store-dir /home/node/.pnpm-store
WORKDIR /filing-deadlines
COPY pnpm-*.yaml ./
RUN pnpm fetch

COPY backend-shared backend-shared
COPY fs-shared fs-shared
COPY repl repl
RUN pnpm install --offline --frozen-lockfile --reporter=append-only


WORKDIR /filing-deadlines/repl
RUN pnpm run build
CMD ["node", "index.js"]
