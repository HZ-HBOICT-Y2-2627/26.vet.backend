"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const registry_1 = require("./routes/registry");
const errorHandling_1 = require("./middleware/errorHandling");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'api-gateway-service',
        environment: NODE_ENV,
        upstreams: {
            registryService: process.env.REGISTRY_SERVICE_URL || 'http://localhost:4000',
        },
    });
});
app.use(registry_1.registryProxy);
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
app.use(errorHandling_1.errorHandler);
app.listen(PORT, () => {
    console.log(`API gateway running at http://localhost:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`→ /animals   → ${process.env.REGISTRY_SERVICE_URL || 'http://localhost:4000'}`);
});
//# sourceMappingURL=server.js.map