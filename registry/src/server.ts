import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ownersRouter } from './routes/owners';
import { animalsRouter } from './routes/animals';
import { errorHandler } from './middleware/errorHandling';

dotenv.config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV });
});

app.use('/owners', ownersRouter);
app.use('/animals', animalsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
