import { createProxyMiddleware } from 'http-proxy-middleware';
import type { ServerResponse } from 'http';

const target = process.env.REGISTRY_SERVICE_URL || 'http://localhost:4000';

export const registryProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathFilter: (path) => path.startsWith('/animals'),
  on: {
    error: (_err, _req, res) => {
      const response = res as ServerResponse;
      response.writeHead(502, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'registry-service is unavailable' }));
    },
  },
});
