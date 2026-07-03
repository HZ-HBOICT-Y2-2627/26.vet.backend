import { prisma } from '../lib/prisma';
import { Species } from '../generated/prisma/enums';
import { CreateAnimalInput, UpdateAnimalInput } from '../validation/schemas';

export class AnimalService {
  async create(data: CreateAnimalInput) {
    return prisma.animal.create({
      data,
      include: { owner: true, patientIdentifier: true },
    });
  }

  async update(id: string, data: UpdateAnimalInput) {
    return prisma.animal.update({
      where: { id },
      data,
      include: { owner: true, patientIdentifier: true },
    });
  }

  async softDelete(id: string) {
    return prisma.animal.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() },
      include: { owner: true, patientIdentifier: true },
    });
  }

  async getAll(species?: Species) {
    return prisma.animal.findMany({
      where: { deleted: false, ...(species ? { species } : {}) },
      include: { owner: true, patientIdentifier: true },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.animal.findFirst({
      where: { id, deleted: false },
      include: {
        owner: true,
        patientIdentifier: true,
        vaccinations: { orderBy: { administeredDate: 'desc' } },
      },
    });
  }
}

export const animalService = new AnimalService();
