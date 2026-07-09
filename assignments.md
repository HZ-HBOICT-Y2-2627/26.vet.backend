# Assignments — Wiring `auth-service` into the API Gateway

## Before you start: the concepts

You've already built a gateway that proxies traffic to `registry` (`/owners`, `/animals`, `/vaccinations`). Now there's a second backend service, `auth-service`, and the goal across these assignments is to connect it the same way — plus teach the gateway to actually check *who* is calling it.

Read `auth-service/README.md` first. Then make sure you can explain these three ideas before writing any code — you'll need them for assignment 3 in particular:

- **Password hashing.** `auth-service` never stores a plain-text password, only a bcrypt hash. Hashing is one-way — you can check a password against a hash, but you can't reverse a hash back into a password. Look at `UserService.register` and `UserService.login`.
- **JWT (JSON Web Token).** A JWT is `header.payload.signature`. The payload (who the user is, when the token expires) is just base64 — readable by anyone, **not encrypted**. What makes it trustworthy is the signature: an HMAC computed over the payload using a secret key (`JWT_SECRET`). Anyone holding that same secret can recompute the signature and confirm the token is genuine and unmodified, **without a database lookup and without calling auth-service**. That's what "stateless auth" means. Look at `UserService.signToken` (issuing) and `middleware/authenticate.ts` (verifying).
- **Middleware as a pipeline.** Express runs middleware in order; each one either calls `next()` to continue, or ends the request early (e.g. a 401). `authenticate` is just another link in the same kind of chain as `asyncHandler`/`errorHandler`, which you've already used in every service.

If any of those three bullets don't make sense yet, stop and read the corresponding file in `auth-service/src/` before continuing — don't start coding from a guess.

---

## How the assignments are structured

Each assignment has a **goal**, a **starting point**, and a **definition of done** — a way to check your own work before moving on. Work through them in order; later assignments assume earlier ones are finished. None of them require touching `auth-service` itself — only `api-gateway-service` (and its `.env`/`README.md`).

Do not copy-paste code from the `registry` proxy without understanding why each line is there — assignment 2 asks you to explain it.

---

## Assignment 1 — Fix the port collision

**Goal:** Get all three services running at the same time, on different ports.

**Starting point:** Look at `registry/.env` and `auth-service/.env`.

**Task:**
1. Run `registry`, `api-gateway-service`, and `auth-service` locally at the same time (`npm run dev` in each, three terminals).
2. You'll hit a problem. Find it, and explain in one sentence *why* it happens (hint: `lsof -i :4000` or just read the error).
3. Fix it by changing `auth-service`'s `PORT` to `4001` in its `.env`.
4. Update `api-gateway-service/.env` with a new variable, `AUTH_SERVICE_URL=http://localhost:4001`, following the same naming pattern as `REGISTRY_SERVICE_URL`.

**Definition of done:** all three `npm run dev` processes stay up simultaneously, and `curl http://localhost:4001/health` responds.

---

## Assignment 2 — Proxy `/auth` through the gateway

**Goal:** Make `POST http://localhost:3000/auth/register` reach `auth-service`, the same way `POST http://localhost:3000/animals` already reaches `registry`.

**Starting point:** `api-gateway-service/src/routes/registry.ts` — this is your reference implementation, not something to reuse directly (it proxies a different service).

**Task:**
1. Read `registry.ts` line by line and write down, in your own words, what each part does:
   - Why does `pathFilter` check several path prefixes?
   - What does `changeOrigin: true` actually do to the outgoing request?
   - What does `fixRequestBody` fix, and *why* is the bug there in the first place? (Hint: look at where `express.json()` is called in `server.ts` relative to where the proxy is mounted.)
2. Create a new proxy (in a new file, e.g. `src/routes/auth.ts`, or by extending the existing pattern — your call) that forwards any path starting with `/auth` to `AUTH_SERVICE_URL`.
3. Mount it in `server.ts`, and update the gateway's `/health` response and startup log to also report the `auth-service` upstream (follow the existing pattern for `registryService`).

**Definition of done:**
- `curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"student@example.com","password":"supersecret1"}'` returns a token, proxied through the gateway.
- `curl -X POST http://localhost:3000/auth/login ...` and `curl http://localhost:3000/auth/me -H "Authorization: Bearer <token>"` both work the same way.
- A request to a path that isn't `/owners`, `/animals`, `/vaccinations`, or `/auth` still 404s.

---

## Assignment 3 — Design decision: how should the gateway verify tokens?

**Goal:** Before writing verification code, decide *how* it should work — this is a design question, not a coding one.

**Task:** Read the two options below and write a short paragraph (in `api-gateway-service/README.md`, in a new "Authentication" section) explaining which one you're choosing and why. There's no single correct answer — the point is reasoning about the trade-off.

- **Option A — Local verification.** The gateway imports `jsonwebtoken` and verifies the token itself, using a `JWT_SECRET` it shares with `auth-service`. Fast (no network call), but now two services must be kept in sync with the same secret.
- **Option B — Ask auth-service.** The gateway calls `GET /auth/me` on `auth-service` with the incoming token on every protected request, and only proxies onward if that call succeeds. Only `auth-service` ever holds the secret, but every protected request now costs an extra network round trip and a hard dependency on `auth-service` being reachable.

**Definition of done:** a committed paragraph in the README stating the choice and the reasoning — this becomes the spec for assignment 4.

---

## Assignment 4 — Implement the authentication middleware

**Goal:** Build the middleware your assignment-3 write-up describes.

**Starting point:** `auth-service/src/middleware/authenticate.ts` is your reference for what "verify a Bearer token" looks like in code — but the gateway's version won't be identical (it has no Prisma/User model, and if you picked Option B it doesn't call `jwt.verify` at all).

**Task:**
1. Create `src/middleware/authenticate.ts` in `api-gateway-service` implementing whichever option you chose.
2. It should read the `Authorization: Bearer <token>` header, and either:
   - attach the decoded payload to `req` and call `next()`, or
   - respond `401` with a JSON error body matching the style already used elsewhere in this repo (check how `registry`'s error responses are shaped — `{ "error": { "code": "...", "message": "..." } }`).
3. **Do not wire it into any route yet** — write a throwaway test route or use a unit test to confirm it accepts a valid token and rejects a missing/invalid/expired one. (Try registering, waiting isn't practical for expiry — instead try passing a token signed with the wrong secret, or a truncated token.)

**Definition of done:** the middleware correctly accepts a real token from `/auth/login` and rejects: no header, a malformed header, and a token with a tampered signature (change one character of a real token and confirm it's rejected).

---

## Assignment 5 — Decide which routes require authentication

**Goal:** Apply the middleware to the right routes — not all-or-nothing.

**Task:**
1. Look at every route currently proxied to `registry` (`GET`/`POST /owners`, `GET`/`POST`/`PATCH`/`DELETE /animals`, `GET /vaccinations`) and decide, route by route, whether it should require a valid token. Write your reasoning as a short table in the README (e.g., should reading a vaccination list require login? Should creating an owner?).
2. Apply your `authenticate` middleware only to the routes you decided need it. (Hint: `http-proxy-middleware`'s proxy is mounted globally in `server.ts` right now — you'll need to either mount `authenticate` before the proxy for specific path patterns, or filter inside the middleware itself.)

**Definition of done:**
- An unauthenticated request to a protected route returns `401` and never reaches `registry` (check the registry's terminal log — it should show no incoming request at all).
- An authenticated request to a protected route succeeds and is proxied through correctly.
- Unprotected routes (per your table) still work with no token.

---

## Assignment 6 — End-to-end test and documentation

**Goal:** Prove the whole flow works, and leave the repo's documentation in the state this project expects.

**Task:**
1. Write out (as a comment, a script, or a `test-api.js`-style file — your choice) a full scenario: register → login → call a protected route with the token → call the same route without a token and confirm the 401 → call an unprotected route without a token and confirm it still works.
2. Update `api-gateway-service/README.md`'s routing table to include `/auth`, and note which routes require authentication.
3. Add a new numbered section to the root `README.md`, following the existing "Branch Notes" style (see sections 1–9) — look at how section 9 documented the previous gateway change as a model for tone and structure (what changed, why, which files).

**Definition of done:** someone who has never seen this code could read the root README and know, without opening a single source file, which routes are public, which require a token, and how to get one.

---

## Stretch goals (optional, if you finish early)

- **Role-based authorization.** `User.role` is either `USER` or `ADMIN`, but nothing currently checks it. Should `DELETE /animals/:id` require `ADMIN`? Design and implement a check.
- **Forwarding identity downstream.** Right now `registry` has no idea who's calling it — the gateway swallows that information. Could you forward `req.user` to `registry` as a header (e.g. `X-User-Id`) when proxying? Would `registry` need to trust that header unconditionally, and what does that imply about network access to `registry` directly (bypassing the gateway)?
- **Token refresh.** Tokens currently expire after 7 days with no way to renew one short of logging in again. What would a refresh-token flow need?
