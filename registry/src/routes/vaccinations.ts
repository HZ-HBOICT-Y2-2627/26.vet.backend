import { Router } from 'express';
import { vaccinationService } from '../services';
import { asyncHandler } from '../middleware/errorHandling';

export const vaccinationsRouter = Router();

vaccinationsRouter.get('/', asyncHandler(async (_req, res) => {
  const vaccinations = await vaccinationService.getAll();
  res.json({ data: vaccinations, meta: { count: vaccinations.length } });
}));
