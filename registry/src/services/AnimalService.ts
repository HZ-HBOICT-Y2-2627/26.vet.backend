import { prisma } from '../lib/prisma';

export class AnimalService {
  async getAll() {
    return prisma.animal.findMany({
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
