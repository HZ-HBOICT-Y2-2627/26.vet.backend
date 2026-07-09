import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registryProxy, REGISTRY_PATHS } from './routes/registry';
import { authProxy, AUTH_PATHS } from './routes/auth';
import { authenticate } from './middleware/authenticate';
import { errorHandler } from './middleware/errorHandling';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Owners and animals both carry/nest owner PII (email, phone, address, GDPR
// consent), including on GET responses — see README.md "Authentication" for
// the full reasoning. Vaccinations returns clinical data only, and /auth
// must stay reachable without a token or nobody could ever log in.
const PROTECTED_PATHS = ['/owners', '/animals'];

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway-service',
    environment: NODE_ENV,
    upstreams: {
      registryService: process.env.REGISTRY_SERVICE_URL || 'http://localhost:4000',
      authService: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    },
  });
});

app.use(authProxy);
app.use(PROTECTED_PATHS, authenticate);
app.use(registryProxy);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  const registryUrl = process.env.REGISTRY_SERVICE_URL || 'http://localhost:4000';
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
  console.log(`API gateway running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  AUTH_PATHS.forEach((path) => console.log(`→ ${path.padEnd(14)} → ${authUrl} (public)`));
  REGISTRY_PATHS.forEach((path) => {
    const visibility = PROTECTED_PATHS.includes(path) ? 'requires token' : 'public';
    console.log(`→ ${path.padEnd(14)} → ${registryUrl} (${visibility})`);
  });
});
