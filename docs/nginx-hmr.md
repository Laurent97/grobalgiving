Nginx reverse proxy for Next.js dev HMR

This snippet helps proxy WebSocket HMR requests to a Next.js dev server running on a backend host (e.g. 127.0.0.1:3000). It ensures the `Upgrade` and `Connection` headers are forwarded so WebSocket upgrades succeed.

Example location block:

```
location /_next/webpack-hmr {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Also ensure other Next.js asset paths are proxied
location /_next/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
}

# Proxy other app routes (optional)
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
}
```

Notes:
- If you access the dev server from a different host/IP (for example from another machine or a container), add that origin to `allowedDevOrigins` in `next.config.js` (or `next.config.ts`) while developing.

Example `next.config.js`:

```js
module.exports = {
  allowedDevOrigins: ['10.5.0.2']
}
```

- Use this only for local/dev environments. In production you should run a proper build (`next build` + `next start`) and proxy the built server or serve via a production host.
- Some corporate proxies and firewalls may still block WebSocket upgrades; ensure they allow `101 Switching Protocols` responses.
