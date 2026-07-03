import { Router } from 'express';
import { animalService } from '../services';
import { asyncHandler } from '../middleware/errorHandling';
import { Species } from '../generated/prisma/enums';

export const animalsRouter = Router();

animalsRouter.get('/', asyncHandler(async (req, res) => {
  const { species } = req.query;

  if (species !== undefined && !Object.values(Species).includes(species as Species)) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: `species must be one of: ${Object.values(Species).join(', ')}` },
    });
    return;
  }

  const animals = await animalService.getAll(species as Species | undefined);
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
