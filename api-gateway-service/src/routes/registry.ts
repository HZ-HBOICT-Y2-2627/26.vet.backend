import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import type { ServerResponse } from 'http';

const target = process.env.REGISTRY_SERVICE_URL || 'http://localhost:4000';

export const REGISTRY_PATHS = ['/owners', '/animals', '/vaccinations'];

export const registryProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathFilter: (path) => REGISTRY_PATHS.some((prefix) => path.startsWith(prefix)),
  on: {
    // server.ts runs express.json() before this proxy, which drains the request
    // stream; re-serialize the parsed body onto the proxied request, or else
    // writes/PATCHes reach the registry service with an empty body.
    proxyReq: fixRequestBody,
    error: (_err, _req, res) => {
      const response = res as ServerResponse;
      response.writeHead(502, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'registry-service is unavailable' }));
    },
  },
});
