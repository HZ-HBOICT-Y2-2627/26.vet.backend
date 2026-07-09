# api-gateway-service

A single entry point that proxies incoming HTTP traffic to the backend services in this repo. It does not hold any data or state of its own — it's a thin routing layer built on Express and [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware).

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- The `registry` service running locally (see `../registry/README.md`)

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

| Path | Proxied to |
| --- | --- |
| `/owners` | `registry` service (`REGISTRY_SERVICE_URL`) |
| `/animals` | `registry` service (`REGISTRY_SERVICE_URL`) |
| `/vaccinations` | `registry` service (`REGISTRY_SERVICE_URL`) |
| `/health` | handled locally, reports gateway status and configured upstreams |

Requests to any other path receive a `404`.

This is a pass-through proxy — it doesn't re-implement each CRUD route, it just forwards matching paths (any method: `GET`/`POST`/`PATCH`/`DELETE`) to the registry service and streams back its response, including error responses. The registry service is the source of truth for request validation and business logic.

Because `express.json()` runs before the proxy (so `/health` and other local routes can read a JSON body), `POST`/`PATCH` request bodies are already parsed by the time they reach the proxy. The proxy re-serializes them via `http-proxy-middleware`'s `fixRequestBody` (wired into `on.proxyReq`) — without it, write requests forwarded through the gateway hang waiting for a body that was already consumed.

See `src/routes/registry.ts` for the proxy definition and `src/server.ts` for how it's mounted.

---

## Environment Variables

```env
PORT=3000
NODE_ENV=development

# Downstream services
REGISTRY_SERVICE_URL=http://localhost:4000
```

---

## Dependencies

### Production

- **express** — web framework
- **http-proxy-middleware** — request proxying
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
