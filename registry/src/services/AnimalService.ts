import { prisma } from '../lib/prisma';
import { Species } from '../generated/prisma/enums';

export class AnimalService {
  async getAll(species?: Species) {
    return prisma.animal.findMany({
      where: species ? { species } : undefined,
      include: { owner: true, patientIdentifier: true },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.animal.findUnique({
      where: { id },
      include: {
        owner: true,
        patientIdentifier: true,
        vaccinations: { orderBy: { administeredDate: 'desc' } },
      },
    });
  }
}

export const animalService = new AnimalService();
