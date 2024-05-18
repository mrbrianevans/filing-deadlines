FROM node:22 as build_ui

RUN corepack enable && corepack prepare pnpm@9.1.1 --activate && pnpm store path
WORKDIR /filing-deadlines
COPY pnpm-*.yaml ./
RUN pnpm fetch

COPY .dockerignore .dockerignore

COPY fs-shared fs-shared
COPY client client
RUN pnpm install --offline --frozen-lockfile --reporter=append-only

WORKDIR /filing-deadlines/client

RUN pnpm build


FROM caddy

ADD caddy/Caddyfile /etc/caddy/Caddyfile

COPY --from=build_ui /filing-deadlines/client/dist /client

EXPOSE 80/tcp
EXPOSE 443/tcp
EXPOSE 2022/tcp
