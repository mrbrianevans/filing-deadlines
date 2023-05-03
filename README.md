# Filing deadlines
[![Light house scores](https://github.com/mrbrianevans/filing-deadlines/actions/workflows/lighthouse.yaml/badge.svg)](https://github.com/mrbrianevans/filing-deadlines/actions/workflows/lighthouse.yaml)
[![Build and run server](https://github.com/mrbrianevans/filing-deadlines/actions/workflows/server.yaml/badge.svg)](https://github.com/mrbrianevans/filing-deadlines/actions/workflows/server.yaml)
[![Build client](https://github.com/mrbrianevans/filing-deadlines/actions/workflows/client.yaml/badge.svg)](https://github.com/mrbrianevans/filing-deadlines/actions/workflows/client.yaml)

## Services (in `docker-compose-yaml`)

### Client
Client side code written in Svelte using Svelte UI library.

### Caddy
Caddyserver is used to proxy the backend and serve the static files of the frontend.

### Redis
Redis in-memory database is used as the main datastore of the application, as well as used by BullMQ.

### Server
REST API written in NodeJS with Fastify, serving data endpoints to the frontend.

### Worker
Background worker (with BullMQ), running jobs to load the database and keep it up-to-date.

### REPL
Read-Evaluate-Print-Loop for administering the server side processes. Can interact with BullMQ jobs and Redis data.
```bash
docker compose exec repl node index.js
```


## Code sharing
There is some shared code between services to avoid duplication (DRY).

### `backend-shared`
This directory can be used by any backend service. It can access server-only components like Redis database.

### `fs-shared`
Full-stack shared directory. Can be accessed by any service including the client. Should mostly contain type definitions.


## Update packages
To update all the NPM packages in this repository, run this command in the root:
```
pnpm update --recursive --latest
```
