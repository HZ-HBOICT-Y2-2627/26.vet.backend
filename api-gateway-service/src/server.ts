import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registryProxy } from './routes/registry';
import { errorHandler } from './middleware/errorHandling';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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
    },
  });
});

app.use(registryProxy);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API gateway running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`→ /animals   → ${process.env.REGISTRY_SERVICE_URL || 'http://localhost:4000'}`);
});
