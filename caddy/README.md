# Caddy
Caddy is used to handle inbound network traffic. 
It reverse-proxies the backend server, and also acts as a static file server for frontend assets.

## Changing config in production
Usually, changes are made to the Caddyfile in development and tested before going to production, 
but in the event of a bug slipping through, this is how you can alter the config in production 
without rebuilding the Docker image.

Caddyfile is stored at `/etc/caddy/Caddyfile`.

- Cannot edit the Caddyfile directly, because the lightweight Docker image doesn't include any text editor.
- Could potentially use `docker cp` to copy a file from the host to the container.
- Can use the admin API to modify the config (recommended way of doing it)

```bash
curl "http://localhost:2019/load" \
	-H "Content-Type: text/caddyfile" \
	--data-binary @Caddyfile
```

> This could be added to the REPL using `fetch('caddy:2019')` to make it easier.

After editing the Caddyfile, use `caddy reload` to apply the change.
