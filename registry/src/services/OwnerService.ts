import { prisma } from '../lib/prisma';

export class OwnerService {
  async getAll() {
    return prisma.owner.findMany({
      include: { animals: true },
      orderBy: { lastName: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.owner.findUnique({
      where: { id },
      include: {
        animals: {
          include: {
            patientIdentifier: true,
            vaccinations: { orderBy: { administeredDate: 'desc' } },
          },
        },
      },
    });
  }
}

export const ownerService = new OwnerService();
