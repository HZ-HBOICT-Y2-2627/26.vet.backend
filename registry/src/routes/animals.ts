import { Router } from 'express';
import { animalService, ownerService } from '../services';
import { asyncHandler } from '../middleware/errorHandling';
import { Species } from '../generated/prisma/enums';
import { createAnimalSchema, updateAnimalSchema } from '../validation/schemas';

export const animalsRouter = Router();

animalsRouter.post('/', asyncHandler(async (req, res) => {
  const data = createAnimalSchema.parse(req.body);

  const owner = await ownerService.getById(data.ownerId);
  if (!owner) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Owner not found' } });
    return;
  }

  const animal = await animalService.create(data);
  res.status(201).json({ data: animal });
}));

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

animalsRouter.patch('/:id', asyncHandler(async (req, res) => {
  const data = updateAnimalSchema.parse(req.body);

  const animal = await animalService.getById(req.params.id);
  if (!animal) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Animal not found' } });
    return;
  }

  if (data.ownerId) {
    const owner = await ownerService.getById(data.ownerId);
    if (!owner) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Owner not found' } });
      return;
    }
  }

  const updated = await animalService.update(req.params.id, data);
  res.json({ data: updated });
}));

animalsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const animal = await animalService.getById(req.params.id);
  if (!animal) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Animal not found' } });
    return;
  }

  const deleted = await animalService.softDelete(req.params.id);
  res.json({ data: deleted });
}));
