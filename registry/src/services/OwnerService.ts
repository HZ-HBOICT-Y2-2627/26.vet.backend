import { prisma } from '../lib/prisma';
import { CreateOwnerInput } from '../validation/schemas';

export class OwnerService {
  async create(data: CreateOwnerInput) {
    return prisma.owner.create({ data });
  }

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
