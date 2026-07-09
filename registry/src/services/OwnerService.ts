import { prisma } from '../lib/prisma';
import { CreateOwnerInput } from '../validation/schemas';

export class OwnerService {
  async create(data: CreateOwnerInput) {
    const { gdprConsent, gdprConsentDate, ...owner } = data;
    return prisma.owner.create({
      data: {
        ...owner,
        consentRecords: {
          create: { granted: gdprConsent, consentDate: gdprConsentDate },
        },
      },
      include: { consentRecords: true },
    });
  }

  async getAll() {
    return prisma.owner.findMany({
      include: {
        animals: true,
        consentRecords: { orderBy: { consentDate: 'desc' } },
      },
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
        consentRecords: { orderBy: { consentDate: 'desc' } },
      },
    });
  }
}

export const ownerService = new OwnerService();
