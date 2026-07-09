# api-gateway-service

A single entry point that proxies incoming HTTP traffic to the backend services in this repo. It does not hold any data or state of its own — it's a thin routing layer built on Express and [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware).

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- The `registry` service running locally (see `../registry/README.md`)
- The `auth-service` running locally (see `../auth-service/README.md`) — required for `/auth` and for obtaining a token to access `/owners`/`/animals`

### Installation

```bash
npm install
npm run dev
```

The gateway will be available at <http://localhost:3000>.

### Build for Production

```bash
npm run build
npm start
```

---

## Routing

| Path | Proxied to | Auth required |
| --- | --- | --- |
| `/auth` | `auth-service` (`AUTH_SERVICE_URL`) | No — must stay reachable so anyone can register/log in |
| `/owners` | `registry` service (`REGISTRY_SERVICE_URL`) | Yes |
| `/animals` | `registry` service (`REGISTRY_SERVICE_URL`) | Yes |
| `/vaccinations` | `registry` service (`REGISTRY_SERVICE_URL`) | No |
| `/health` | handled locally, reports gateway status and configured upstreams | No |

Requests to any other path receive a `404`.

This is a pass-through proxy — it doesn't re-implement each CRUD route, it just forwards matching paths (any method: `GET`/`POST`/`PATCH`/`DELETE`) to the upstream service and streams back its response, including error responses. Each upstream service is the source of truth for its own request validation and business logic; the gateway's only job on top of proxying is deciding *whether a request is even allowed through*.

Because `express.json()` runs before the proxy (so `/health` and other local routes can read a JSON body), `POST`/`PATCH` request bodies are already parsed by the time they reach the proxy. The proxy re-serializes them via `http-proxy-middleware`'s `fixRequestBody` (wired into `on.proxyReq`) — without it, write requests forwarded through the gateway hang waiting for a body that was already consumed. Both `src/routes/registry.ts` and `src/routes/auth.ts` need this.

See `src/routes/registry.ts` / `src/routes/auth.ts` for the proxy definitions and `src/server.ts` for how they're mounted.

---

## Authentication

`auth-service` issues JWTs; this gateway is where they get *checked* before a request is allowed to reach `registry`.

### Local verification, not a call to auth-service

There are two ways a gateway can check a token:

1. **Verify it locally** — the gateway holds the same `JWT_SECRET` as `auth-service` and calls `jwt.verify()` itself. No network call, no dependency on `auth-service` being up for every protected request — that's the whole appeal of a JWT being *stateless*.
2. **Ask auth-service** — call `GET /auth/me` with the incoming token on every protected request and only proceed if that succeeds. Only one service ever holds the secret, but now every protected request costs an extra hop and a hard runtime dependency on `auth-service`.

This gateway uses **option 1** (see `src/middleware/authenticate.ts`). The trade-off accepted: `JWT_SECRET` must be kept in sync between `auth-service` and `api-gateway-service` (both `.env` files) — a config burden, but a small one for a two-service secret, and it avoids coupling every registry request's latency and availability to a second service being reachable.

### Which routes require a token, and why

The dividing line isn't "reads vs. writes" — it's *does the response contain owner PII*:

- **`/owners` and `/animals` are fully protected (`GET` included).** `GET /animals/:id` nests the full `owner` object — email, phone, address, GDPR consent history — directly in the response. A "read-only" animals endpoint leaks exactly the same personal data `/owners` does, so protecting only `/owners` would have been a false sense of security.
- **`/vaccinations` stays public.** `VaccinationService.getAll()` returns clinical records only (vaccine name, dates, batch number, administering vet's ID) — no owner or animal-owner join, so there's no PII to gate.
- **`/auth/*` is never protected by this middleware.** `POST /auth/register` and `POST /auth/login` have to be reachable *without* a token, or nobody could ever obtain one. (`GET /auth/me` already requires a token, but that's enforced by `auth-service` itself, not the gateway.)

This is implemented as a path-based `app.use(['/owners', '/animals'], authenticate)` in `server.ts`, mounted before `registryProxy` — an unauthenticated request never reaches `registry` at all (check `registry`'s own request log: a rejected request doesn't appear in it).

### Error shape

A missing, malformed, or invalid/expired token gets a `401` matching the error envelope `registry` already uses:

```json
{ "error": { "code": "UNAUTHORIZED", "message": "Missing or invalid Authorization header" } }
```

---

## Environment Variables

```env
PORT=3000
NODE_ENV=development

# Downstream services
REGISTRY_SERVICE_URL=http://localhost:4000
AUTH_SERVICE_URL=http://localhost:4001

# Must match auth-service's JWT_SECRET — see "Authentication" above
JWT_SECRET=dev-secret-change-in-production
```

---

## Dependencies

### Production

- **express** — web framework
- **http-proxy-middleware** — request proxying
- **jsonwebtoken** — verifies JWTs issued by `auth-service`
- **cors** — CORS middleware
- **dotenv** — loads `.env`

### Development

- **typescript**, **ts-node-dev** — TypeScript tooling

---

## Available Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build         # Compile TypeScript
npm start             # Run compiled build
npm run type-check    # TypeScript check without building
```

---

## License

MIT
