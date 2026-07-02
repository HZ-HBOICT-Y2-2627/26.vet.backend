import { Router } from 'express';
import { ownerService } from '../services';
import { asyncHandler } from '../middleware/errorHandling';

export const ownersRouter = Router();

ownersRouter.get('/', asyncHandler(async (_req, res) => {
  const owners = await ownerService.getAll();
  res.json({ data: owners, meta: { count: owners.length } });
}));

ownersRouter.get('/:id', asyncHandler(async (req, res) => {
  const owner = await ownerService.getById(req.params.id);
  if (!owner) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Owner not found' } });
    return;
  }
  res.json({ data: owner });
}));
