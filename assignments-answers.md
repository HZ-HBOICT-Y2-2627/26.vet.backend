# Assignment Answers — Wiring `auth-service` into the API Gateway

This is the answer key for [assignments.md](assignments.md). Each section below mirrors an assignment number and title, gives the answer, shows the actual code that implements it, and points at the exact file(s) in this branch (`week_5_end`). Read the corresponding assignment in `assignments.md` first — this document assumes that context rather than repeating it.

---

## Assignment 1 — Fix the port collision

**Answer:** `registry/.env` and `auth-service/.env` both defaulted to `PORT=4000`. Whichever service starts second fails with `EADDRINUSE` — the first one to bind the port wins, and it's not always obvious which one that will be, so it looks like a flaky/random failure rather than a fixed bug. Fixed by moving `auth-service` to `4001` and teaching the gateway where to find it.

**Code:**

```diff
# auth-service/.env
- PORT=4000
+ PORT=4001
```

```diff
# api-gateway-service/.env
  REGISTRY_SERVICE_URL=http://localhost:4000
+ AUTH_SERVICE_URL=http://localhost:4001
```

**Reference:** [auth-service/.env](auth-service/.env) (line 5), [api-gateway-service/.env](api-gateway-service/.env) (line 7)

**Elaboration:** This is a config-only fix — no source code changes. It matters that the fix went in `.env`, not a hardcoded fallback in `server.ts`; `auth-service/src/server.ts` still falls back to `process.env.PORT || 4000` if `PORT` is ever unset, so the `.env` file is the only thing actually preventing the collision. Worth having students confirm this by unsetting the env var and observing the collision return.

---

## Assignment 2 — Proxy `/auth` through the gateway

**Answer to the three questions:**

- **Why does `pathFilter` check several path prefixes?** `REGISTRY_PATHS` covers `/owners`, `/animals`, and `/vaccinations` because all three route families share one destination (the registry service) — one proxy instance, one array of prefixes it's allowed to forward. `AUTH_PATHS` only has one entry (`/auth`), but keeps the same array shape as `REGISTRY_PATHS` on purpose, so both proxy files read the same way and a second auth-adjacent path could be added later without changing the pattern.
- **What does `changeOrigin: true` do?** It rewrites the outgoing request's `Host` header to match the *target* (e.g. `localhost:4001`) instead of forwarding the original inbound `Host` header (e.g. `localhost:3000`). Without it, the upstream service sees a `Host` header that doesn't match where it's actually running, which breaks anything downstream that validates or routes on that header (virtual hosts, some CORS configurations, absolute-URL generation).
- **What does `fixRequestBody` fix, and why does the bug exist?** `server.ts` calls `app.use(express.json())` before either proxy is mounted, so by the time a `POST`/`PATCH` request reaches `authProxy` or `registryProxy`, Express has already read the entire request body off the socket and parsed it into `req.body` — the underlying stream is drained. `http-proxy-middleware` proxies by piping the *stream*, not `req.body`, so without intervention it forwards a request with the right headers but no bytes, and the upstream server hangs waiting for a body that will never arrive (confirmed by reproducing the hang before the fix was added — see section 9 of the root README). `fixRequestBody`, wired into `on.proxyReq`, re-serializes `req.body` back onto the outgoing request.

**Code:**

```ts
// api-gateway-service/src/routes/auth.ts
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import type { ServerResponse } from 'http';

const target = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

export const AUTH_PATHS = ['/auth'];

export const authProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathFilter: (path) => AUTH_PATHS.some((prefix) => path.startsWith(prefix)),
  on: {
    proxyReq: fixRequestBody,
    error: (_err, _req, res) => {
      const response = res as ServerResponse;
      response.writeHead(502, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'auth-service is unavailable' }));
    },
  },
});
```

```ts
// api-gateway-service/src/server.ts — mounting
app.use(authProxy);
```

**Reference:** [api-gateway-service/src/routes/auth.ts](api-gateway-service/src/routes/auth.ts) (full file), [api-gateway-service/src/server.ts:37](api-gateway-service/src/server.ts)

**Verified (definition of done):**

```
$ curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" \
    -d '{"email":"e2e.gateway@example.com","password":"supersecret1"}'
{"token":"eyJhbGciOiJIUzI1NiIs...","user":{"id":3,"email":"e2e.gateway@example.com","role":"USER"}}

$ curl http://localhost:3000/nope
{"error":"Not found"}   HTTP 404
```

`login` and `me` were verified the same way (see Assignment 6 for the full scripted run).

---

## Assignment 3 — Design decision: how should the gateway verify tokens?

**Answer:** Chose **Option A — local verification**. The gateway holds the same `JWT_SECRET` as `auth-service` and calls `jwt.verify()` itself, rather than calling `GET /auth/me` on `auth-service` for every protected request.

**Reasoning (written into the README, not just this doc):**

> This gateway uses **option 1** (see `src/middleware/authenticate.ts`). The trade-off accepted: `JWT_SECRET` must be kept in sync between `auth-service` and `api-gateway-service` (both `.env` files) — a config burden, but a small one for a two-service secret, and it avoids coupling every registry request's latency and availability to a second service being reachable.

**Code (the artifact of this decision):**

```diff
# api-gateway-service/.env
+ # Must match auth-service's JWT_SECRET — the gateway verifies tokens
+ # locally rather than calling back to auth-service on every request.
+ JWT_SECRET=dev-secret-change-in-production
```

**Reference:** [api-gateway-service/README.md](api-gateway-service/README.md), "Authentication" → "Local verification, not a call to auth-service" (lines 52–63); [api-gateway-service/.env](api-gateway-service/.env) (lines 9–11)

**Elaboration:** This isn't free of downsides and the README says so explicitly rather than presenting it as a clean win — Option B (delegate to auth-service) would mean only one service ever holds the secret, which is a real security-hygiene advantage in a system with more than two services. The deciding factor here was scale: with only two services sharing the secret, the coordination cost is low, and avoiding a network hop (plus a hard uptime dependency on `auth-service`) on *every single* protected request was judged more valuable. A team running a dozen microservices behind this gateway might reasonably choose differently.

---

## Assignment 4 — Implement the authentication middleware

**Answer:** Built to match Option A. Reads the `Authorization` header, verifies the token with `jsonwebtoken`, attaches the decoded payload to `req.user`, and produces a `401` in `registry`'s nested error shape — not `auth-service`'s own flat `{ error: "message" }` shape — because per assignment 4's instructions, the gateway should be internally consistent with the primary domain service's conventions, not just copy whatever `auth-service` happened to do internally.

**Code:**

```ts
// api-gateway-service/src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/index';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
    });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
};
```

```ts
// api-gateway-service/src/types/index.ts
export type Role = 'USER' | 'ADMIN';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
```

**Reference:** [api-gateway-service/src/middleware/authenticate.ts](api-gateway-service/src/middleware/authenticate.ts) (full file), [api-gateway-service/src/types/index.ts](api-gateway-service/src/types/index.ts)

**Verified (definition of done) — all four cases, actual output:**

```
# valid token
$ curl http://localhost:3000/owners -H "Authorization: Bearer $TOKEN"
{"data":[...]}   HTTP 200

# no header
$ curl http://localhost:3000/owners
{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid Authorization header"}}   HTTP 401

# malformed body while unauthenticated (still 401 before it ever reaches validation)
$ curl -X POST http://localhost:3000/animals -H "Content-Type: application/json" -d '{}'
{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid Authorization header"}}   HTTP 401

# tampered signature (last character of a real token flipped)
$ curl http://localhost:3000/owners -H "Authorization: Bearer ${TOKEN%?}X"
{"error":{"code":"UNAUTHORIZED","message":"Invalid or expired token"}}   HTTP 401
```

**Elaboration:** Note the two different messages — "Missing or invalid Authorization header" (no `Bearer` prefix at all) vs. "Invalid or expired token" (a `Bearer` token that fails `jwt.verify` — wrong signature, malformed JWT, or an expired `exp` claim all land in the same `catch` block, since `jsonwebtoken` throws for all three and the middleware doesn't need to distinguish them for the caller).

---

## Assignment 5 — Decide which routes require authentication

**Answer:** The dividing line is **not** read vs. write — it's whether the response contains owner PII.

| Route | Auth required? | Why |
| --- | --- | --- |
| `GET /owners`, `POST /owners` | Yes | The resource *is* owner PII — name, email, phone, address, GDPR consent history |
| `GET /animals`, `GET /animals/:id`, `POST /animals`, `PATCH /animals/:id`, `DELETE /animals/:id` | Yes | `AnimalService` includes the full `owner` object in every response (see `registry/src/services/AnimalService.ts`) — an unauthenticated read of `/animals` leaks exactly the same PII `/owners` protects |
| `GET /vaccinations` | No | `VaccinationService.getAll()` returns clinical records only — vaccine name, dates, batch number, administering vet's ID — no owner or animal join |
| `/auth/register`, `/auth/login` | No | Have to be reachable *without* a token, or nobody could ever obtain one |
| `/auth/me` | Enforced by `auth-service` itself, not the gateway | Already requires a token via `auth-service`'s own `authenticate` middleware; the gateway doesn't need to duplicate that check |

**Code:**

```ts
// api-gateway-service/src/server.ts
const PROTECTED_PATHS = ['/owners', '/animals'];
// ...
app.use(authProxy);                       // /auth — public, mounted first
app.use(PROTECTED_PATHS, authenticate);   // gate /owners and /animals
app.use(registryProxy);                   // proxy everything (vaccinations falls through ungated)
```

**Reference:** [api-gateway-service/src/server.ts:14-18,37-39](api-gateway-service/src/server.ts)

**Elaboration on why mounting order matters:** `authProxy` is mounted *before* `app.use(PROTECTED_PATHS, authenticate)`, so a request to `/auth/register` is proxied and the response sent before Express ever reaches the `authenticate` middleware — `/auth` is structurally exempt, not just excluded from the `PROTECTED_PATHS` array by omission. `app.use(PROTECTED_PATHS, authenticate)` uses Express's prefix matching (an array of path patterns), so it applies to `/owners`, `/owners/abc-123`, `/animals/abc-123/whatever`, etc. — anything starting with those prefixes — without needing per-route wiring.

**Verified (definition of done):** an unauthenticated `GET /owners` returns `401` and produces **no corresponding line in `registry`'s own request log** — confirmed by tailing `registry`'s log during testing: only the *successful*, authenticated `GET /owners` and the public `GET /vaccinations` appear, the rejected calls don't, proving the gateway short-circuits before proxying.

---

## Assignment 6 — End-to-end test and documentation

**Answer:** Built an automated scenario in `test-api.js` covering the full flow, plus updated both READMEs.

**Code (the test list — see the file for the full request helper):**

```js
// api-gateway-service/test-api.js
const tests = [
  { name: 'Health check', fn: () => request('GET', '/health') },
  { name: 'GET /vaccinations (public) without token', expect: 200,
    fn: () => request('GET', '/vaccinations') },
  { name: 'GET /owners (protected) without token -> 401', expect: 401,
    fn: () => request('GET', '/owners') },
  { name: 'POST /auth/register (public) -> issues a token', expect: 201,
    fn: async () => {
      const res = await request('POST', '/auth/register', { body: { email, password } });
      token = res.data?.token;
      return res;
    } },
  { name: 'POST /auth/login (public) with the same credentials', expect: 200,
    fn: () => request('POST', '/auth/login', { body: { email, password } }) },
  { name: 'GET /auth/me with token', expect: 200,
    fn: () => request('GET', '/auth/me', { token }) },
  { name: 'GET /owners (protected) with token -> 200', expect: 200,
    fn: () => request('GET', '/owners', { token }) },
  { name: 'GET /owners (protected) with a tampered token -> 401', expect: 401,
    fn: () => request('GET', '/owners', { token: `${token?.slice(0, -1)}X` }) },
];
```

**Reference:** [api-gateway-service/test-api.js](api-gateway-service/test-api.js) (full file), [api-gateway-service/README.md](api-gateway-service/README.md) (Routing table + Authentication section), [README.md](README.md) section 10

**Verified (definition of done) — actual run output:**

```
$ node test-api.js

API GATEWAY TEST SUITE

Testing: Health check
  OK (200)
Testing: GET /vaccinations (public) without token
  OK (200)
Testing: GET /owners (protected) without token -> 401
  OK (401)
Testing: POST /auth/register (public) -> issues a token
  OK (201)
Testing: POST /auth/login (public) with the same credentials
  OK (200)
Testing: GET /auth/me with token
  OK (200)
Testing: GET /owners (protected) with token -> 200
  OK (200)
Testing: GET /owners (protected) with a tampered token -> 401
  OK (401)

All tests passed!
```

The write path (`POST /animals` with/without a token, then cleaned up with `DELETE /animals/:id`) was verified manually with `curl` rather than added to `test-api.js`, to avoid the script leaving behind animal records on every run — `test-api.js` uses a timestamp-suffixed email specifically so it can run repeatedly without colliding on the unique `email` constraint, but there's no equivalent cheap "make a disposable animal" story without also cleaning it up, which felt like more test-harness machinery than this exercise needed. A student extending this could add a `POST`/`DELETE /animals` pair back-to-back inside one test to keep it self-cleaning.

The root README's section 10 documents the change in the same "what changed → why → files" format as every other section (1–9) in that document — see [README.md#10-auth-service-wired-into-the-gateway-jwt-protected-routes](README.md).

---

## Stretch goals — not implemented

These were left undone deliberately (the assignment marks them optional), but here's the shape an answer would take, for a student who wants to attempt them:

- **Role-based authorization.** `JwtPayload.role` already flows through the middleware (`req.user.role`) — nothing currently reads it. A second middleware, e.g. `requireRole('ADMIN')`, could be composed after `authenticate` on just the `DELETE /animals/:id` route: `app.use('/animals/:id', authenticate, requireRole('ADMIN'), ...)` won't work directly with the current proxy-based routing (there's no per-route handler to attach middleware to inside a proxied path), so this would likely require either switching `DELETE /animals/:id` to a dedicated non-proxied route, or checking `req.method === 'DELETE'` inside a single combined middleware before the proxy.
- **Forwarding identity downstream.** `fixRequestBody`'s `on.proxyReq` hook is also where you'd add `proxyReq.setHeader('X-User-Id', req.user.sub)` before forwarding. The open design question (worth discussing with students, not just answering): if `registry` trusts an `X-User-Id` header unconditionally, anyone who can reach `registry` directly (bypassing the gateway) can impersonate any user — so this only becomes safe once `registry` is no longer reachable except through the gateway (e.g. not exposing its port publicly, or checking a second shared secret between gateway and registry).
- **Token refresh.** Would need a new `auth-service` endpoint (e.g. `POST /auth/refresh`) and a decision about *how* a refresh token is issued and stored (a second, longer-lived token in an httpOnly cookie is the common approach) — this touches `auth-service`'s domain more than the gateway's, so it wasn't in scope for this integration pass.
