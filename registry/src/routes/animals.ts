import { Router } from 'express';
import { animalService } from '../services';
import { asyncHandler } from '../middleware/errorHandling';

export const animalsRouter = Router();

animalsRouter.get('/', asyncHandler(async (_req, res) => {
  const animals = await animalService.getAll();
  res.json({ data: animals, meta: { count: animals.length } });
}));

animalsRouter.get('/:id', asyncHandler(async (req, res) => {
  const animal = await animalService.getById(req.params.id);
  if (!animal) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Animal not found' } });
    return;
  }
  res.json({ data: animal });
}));
