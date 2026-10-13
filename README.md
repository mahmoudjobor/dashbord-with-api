# Ishtari.com Full-Stack Assessment

```
your-submission/
├── dashboard-nextjs/   Next.js 14 (App Router) + TypeScript + Zod
└── api-nodejs/         Express REST API (Route → Controller → Service → Model)
```

Requires Node.js 18+.

## 1. Run the API (api-nodejs)

```bash
cd api-nodejs
npm install
cp .env.example .env        # edit JWT_SECRET
npm run dev                 # or: npm start   -> http://localhost:3001
```

### Run with PM2

```bash
npm install -g pm2
cd api-nodejs

# production requires a strong secret (>= 32 chars), otherwise the app refuses to boot
sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env && rm .env.bak

pm2 start ecosystem.config.js     # NODE_ENV=production is set in the config
pm2 save                          # optional: persist the process list
```

**Restart only the API** (never `pm2 restart all`, it would touch every app on the server):

```bash
pm2 restart ishtari-api           # use `pm2 reload ishtari-api` for graceful reload
```

**Check logs**

```bash
pm2 logs ishtari-api              # live, both streams
pm2 logs ishtari-api --lines 200  # last 200 lines
tail -f api-nodejs/logs/out.log api-nodejs/logs/error.log
```

**If the process is restarting in a loop, I would check:**

1. `pm2 status` / `pm2 describe ishtari-api` – restart count (`↺`) and uptime that keeps resetting.
2. `logs/error.log` – the real crash reason is almost always the last lines before the restart.
3. Config errors: missing/weak `JWT_SECRET` (the app exits with a clear message on purpose), invalid `PORT`, `.env` not found because `cwd` is wrong.
4. `EADDRINUSE` – another process already owns the port (`lsof -i :3001`).
5. Missing dependencies / wrong Node version (`npm ci`, `node -v`).
6. Out-of-memory kills – `max_memory_restart` is 300M; look for `pm2 describe` memory growth.
7. Uncaught exceptions at startup (bad require path, syntax error after a deploy).

`ecosystem.config.js` limits `max_restarts` to 10 with `min_uptime` 10s, so a broken deploy ends up `errored` instead of looping forever.

## 2. Run the dashboard (dashboard-nextjs)

```bash
cd dashboard-nextjs
npm install
cp .env.example .env.local
npm run dev                       # http://localhost:3000
# production: npm run build && npm start
```

The dashboard asks for a JWT. Generate one from the API folder:

```bash
cd api-nodejs
npm run token -- admin     # or: npm run token -- viewer
```

Paste it into the page. Use `viewer` to see the 403 behaviour on write endpoints, and a garbage string to see the 401 state.

## 3. Test the endpoints (curl)

```bash
cd api-nodejs
TOKEN=$(npm run --silent token -- admin)
VIEWER=$(npm run --silent token -- viewer)

# health (public)
curl -i http://localhost:3001/health

# 401 – no token / bad token
curl -i http://localhost:3001/api/products
curl -i -H "Authorization: Bearer not-a-real-token" http://localhost:3001/api/products

# list, search, filter, paginate
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/products?search=coffee&status=active&page=1&limit=5"

# get one (copy an id from the list)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products/<id>

# create
curl -i -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":19.99}'

# validation error (400)
curl -i -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"","price":-5}'

# update status
curl -i -X PUT http://localhost:3001/api/products/<id>/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"out_of_stock"}'

# 403 – viewer role cannot write
curl -i -X PUT http://localhost:3001/api/products/<id>/status \
  -H "Authorization: Bearer $VIEWER" -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'
```

Error format is always `{ "error": { "code": "...", "message": "...", "details"?: [...] } }`.

## 4. Architecture

**API** – every request flows `Route → Controller → Service → Model`:

| Layer | Responsibility |
|---|---|
| `routes/` | endpoints + middleware order only |
| `controllers/` | read validated input, call a service, write the response |
| `services/` | business rules (search/filter/pagination, duplicate names, 404s) |
| `models/` | data shape + storage (in-memory `Map`, seeded with 8 products) |

Middleware: JWT auth (`Bearer`, HS256 pinned, 401 on missing/invalid), Zod validation (params, query and body, runs before the controller), request logger (method, path, status, ms only), centralized error handler (consistent JSON, no stack traces to the client).

**Dashboard** – one page (`app/page.tsx`) → `useProducts` hook → `services/productService.ts` (the only file that calls `fetch`). The service handles 401/403 explicitly and validates every response with Zod. Types come from `z.infer` in `schemas/product.ts`; there are no `any` types and no hand-written model types.

## 5. Assumptions

- Resource is **Product** with `id`, `name`, `price`, `status` (`active | inactive | out_of_stock`), `createdAt`.
- Storage is in-memory (resets on restart) – the task is about structure, not persistence. Only `models/` would change to use a database.
- The API does not issue tokens (no login endpoint was requested). Tokens are generated locally with `npm run token` using the shared `JWT_SECRET`, as an identity provider would.
- The API runs in a single PM2 fork process because the store is in memory (cluster mode would give each worker its own data).

## 6. Security notes

- JWT verified with a pinned algorithm (`HS256`) to block `alg: none` and algorithm-confusion attacks; tokens expire.
- `JWT_SECRET` only comes from the environment; in production the app refuses to start with a placeholder or a secret shorter than 32 characters.
- All input validated with Zod; body schemas are `.strict()` (unknown fields rejected); IDs must be UUIDs; body limit 10 kb.
- The logger never reads headers or bodies and logs `req.path` without the query string, so tokens cannot leak into logs.
- Errors: unknown errors become a generic 500; stack traces are only written to server logs.
- `helmet`, restricted CORS (`CORS_ORIGIN`), `x-powered-by` disabled, rate limiting on `/api`.
- **Known trade-off:** the dashboard keeps the token in `sessionStorage`, which JavaScript can read, so an XSS bug could steal it. In production I would use a login flow with an `httpOnly`, `SameSite` cookie (or a Next.js route handler acting as a backend-for-frontend).
- `.env` files are git-ignored; only `.env.example` with placeholders is committed.

## 7. Improvements beyond the brief

1. **Role-based access (403):** `viewer` can read; only `admin` can POST/PUT. This gives the dashboard's 403 handling something real to react to.
2. **Server-side search, status filter and pagination** (`?search=&status=&page=&limit=`), with the dashboard debouncing input and cancelling stale requests via `AbortController`.
3. **Fail-fast environment validation** (Zod) plus PM2 crash-loop protection (`max_restarts`, `min_uptime`, memory limit).
4. **Graceful shutdown**, `helmet`, CORS allow-list and rate limiting on the API.
5. **Distinct error states in the UI** (unauthorized, forbidden, network, invalid response) with the right recovery action for each.
