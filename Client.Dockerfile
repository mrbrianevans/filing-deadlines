FROM node:18

RUN corepack enable && corepack prepare pnpm@7.11.0 --activate && pnpm config set store-dir /home/node/.pnpm-store
WORKDIR /filing-deadlines
COPY pnpm-*.yaml ./
RUN pnpm fetch

COPY fs-shared fs-shared
COPY client client
RUN pnpm install --offline --frozen-lockfile --reporter=append-only

WORKDIR /filing-deadlines/client

CMD ["pnpm", "run", "build"]
