# Filing Deadlines

## Cursor Cloud specific instructions

The environment boots the app as local processes. Docker is an additional way to verify the images used in production. Use the local processes for ordinary checks. Use Docker when a change needs to run inside those images.

### Local processes

On boot, `start` brings up Redis, Loki, the API on port 3000, a proxy from port 80 to that API, and Vite on port 5173.

- Open http://localhost:5173. The dev Auth0 application allows the callback `http://localhost:5173/api/sign-in/auth0/callback`. `http://127.0.0.1:5173` is rejected as a callback mismatch.
- The home-page control is **Sign in with email**. It requests `/api/sign-in/auth0`.
- Dependencies are already installed by the environment build. The API command is `node index.js` in `server/`. Vite is `pnpm exec vite --host 0.0.0.0 --port 5173` in `client/`.
- API logs go to Loki, so a quiet terminal does not mean the process is healthy. Readiness is `GET /api/health/serverAlive`.
- A failed boot sets `/tmp/cursor/start-user/start-user.status` to `1`. Read `/tmp/cursor/start-user/start-user.log` and `/tmp/filing-deadlines/server.log`.
- `AUTH0_URL` must be an `https://` origin. `@fastify/oauth2` exits on startup when the value is only a hostname. The boot script prefixes `https://` when the scheme is missing.
- Xero, Stripe, and `SESSION_SECRET` can stay as local placeholders. The worker needs a Companies House stream key. When `CH_STREAM_KEY` is unset and the built worker reads `CH_STREAM_HOST`, the boot script mints a 24-hour session from `https://companies.stream/test`.
- `AUTH0_TEST_EMAIL`, when set, is the dev Auth0 account address. Keep a password in a Runtime Secret so it stays out of the transcript.

### Docker

Production runs the images as Docker Swarm services: `docker stack deploy -c docker-stack.yaml`, using the DigitalOcean registry tags in that file. `docker-compose.yaml` builds the same service set from the Dockerfiles. On a Cloud Agent, Compose is the command that tests the current source. The stack file runs the published registry images. This VM is a Swarm manager only after `docker swarm init`.

Both files read these gitignored env files:

- `.url.env` — `SITE_ADDRESS`, `GRAFANA_ADDRESS`
- `.server.env` — `SESSION_SECRET`
- `.auth0.env` — `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_URL`
- `.xero.env`, `.stripe.env`, `.api.env`

`SITE_ADDRESS` is the Caddy site address and the OAuth redirect base. For the dev Auth0 application, set it to `http://localhost:5173` and publish that port. Caddy serves the built client and proxies `/api` to the server container.

`Backend.Dockerfile` builds the server, worker, and repl. `Frontend.Dockerfile` builds the Vite client and serves it with Caddy. Loki, Prometheus, and Grafana build from `monitoring/`.

The API container exits with `AVV_ERR_PLUGIN_EXEC_TIMEOUT` on `@fastify/redis` when Redis is not accepting connections yet. Start Redis first, then recreate the server container.

systemd is not PID 1 here, and `policy-rc.d` blocks `service docker start`. Login shells run `/usr/local/bin/start-docker-daemon.sh`, which clears a stale socket and starts `containerd` and `dockerd`. The app boot script calls that same helper. Use `sudo docker`.
