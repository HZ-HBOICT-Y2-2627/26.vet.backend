import { prisma } from '../lib/prisma';

export class VaccinationService {
  async getAll() {
    return prisma.vaccination.findMany({
      orderBy: { administeredDate: 'desc' },
    });
  }
}

export const vaccinationService = new VaccinationService();
