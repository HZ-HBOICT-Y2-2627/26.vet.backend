"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registryProxy = void 0;
const http_proxy_middleware_1 = require("http-proxy-middleware");
const target = process.env.REGISTRY_SERVICE_URL || 'http://localhost:4000';
exports.registryProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target,
    changeOrigin: true,
    pathFilter: (path) => path.startsWith('/animals'),
    on: {
        error: (_err, _req, res) => {
            const response = res;
            response.writeHead(502, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'registry-service is unavailable' }));
        },
    },
});
//# sourceMappingURL=registry.js.map