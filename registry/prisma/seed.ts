import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/database.sqlite',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  await prisma.vaccination.deleteMany();
  await prisma.patientIdentifier.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.owner.deleteMany();

  // --- Owners ---

  const meijer = await prisma.owner.create({
    data: {
      firstName: 'Anke',
      lastName: 'Meijer',
      email: 'a.meijer@gmail.com',
      phone: '+31612345678',
      address: 'Kerkstraat 14, 1234 AB Amsterdam',
      reminderChannel: 'EMAIL',
      consentRecords: {
        create: { granted: true, consentDate: new Date('2024-03-01') },
      },
    },
  });

  const vandenberg = await prisma.owner.create({
    data: {
      firstName: 'Pieter',
      lastName: 'van den Berg',
      email: 'pieter.vdberg@outlook.com',
      phone: '+31687654321',
      address: 'Molenweg 3, 5678 CD Utrecht',
      reminderChannel: 'SMS',
      consentRecords: {
        create: { granted: true, consentDate: new Date('2024-06-15') },
      },
    },
  });

  const dejong = await prisma.owner.create({
    data: {
      firstName: 'Fatima',
      lastName: 'de Jong',
      email: 'fatima.dejong@ziggo.nl',
      phone: '+31623456789',
      address: 'Wilhelminastraat 88, 9012 EF Rotterdam',
      reminderChannel: 'PHONE',
      consentRecords: {
        create: { granted: true, consentDate: new Date('2025-01-10') },
      },
    },
  });

  // --- Animals ---

  const luna = await prisma.animal.create({
    data: {
      ownerId: meijer.id,
      name: 'Luna',
      species: 'DOG',
      breed: 'Golden Retriever',
      dateOfBirth: new Date('2020-04-12'),
      sex: 'FEMALE',
    },
  });

  const pip = await prisma.animal.create({
    data: {
      ownerId: meijer.id,
      name: 'Pip',
      species: 'CAT',
      breed: 'British Shorthair',
      dateOfBirth: new Date('2022-09-03'),
      sex: 'MALE',
    },
  });

  const max = await prisma.animal.create({
    data: {
      ownerId: vandenberg.id,
      name: 'Max',
      species: 'DOG',
      breed: 'Labrador Retriever',
      dateOfBirth: new Date('2019-11-20'),
      sex: 'MALE',
    },
  });

  const noor = await prisma.animal.create({
    data: {
      ownerId: dejong.id,
      name: 'Noor',
      species: 'RABBIT',
      breed: 'Nederlandse Hangoor',
      dateOfBirth: new Date('2023-02-14'),
      sex: 'FEMALE',
    },
  });

  const simba = await prisma.animal.create({
    data: {
      ownerId: dejong.id,
      name: 'Simba',
      species: 'CAT',
      breed: 'Maine Coon',
      dateOfBirth: new Date('2021-07-08'),
      sex: 'MALE',
    },
  });

  // --- Patient Identifiers ---

  await prisma.patientIdentifier.create({
    data: {
      animalId: luna.id,
      chipNumber: '528210000123456',
      vetbaseRecordId: 'VB-2024-00142',
    },
  });

  await prisma.patientIdentifier.create({
    data: {
      animalId: pip.id,
      chipNumber: '528210000234567',
    },
  });

  await prisma.patientIdentifier.create({
    data: {
      animalId: max.id,
      chipNumber: '528210000345678',
      vetbaseRecordId: 'VB-2024-00089',
      labAccessionNumber: 'LAB-2025-00341',
    },
  });

  await prisma.patientIdentifier.create({
    data: {
      animalId: noor.id,
    },
  });

  await prisma.patientIdentifier.create({
    data: {
      animalId: simba.id,
      chipNumber: '528210000456789',
      vetbaseRecordId: 'VB-2025-00210',
    },
  });

  // --- Vaccinations ---

  const vetId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // soft ref to auth DB

  await prisma.vaccination.create({
    data: {
      animalId: luna.id,
      vaccineName: 'Hondsdolheid (Rabiës)',
      administeredDate: new Date('2024-05-10'),
      nextDueDate: new Date('2027-05-10'),
      batchNumber: 'RB-2024-A11',
      administeredBy: vetId,
    },
  });

  await prisma.vaccination.create({
    data: {
      animalId: luna.id,
      vaccineName: 'Parvo / Hondenziekte combinatie',
      administeredDate: new Date('2024-05-10'),
      nextDueDate: new Date('2025-05-10'),
      batchNumber: 'DHPPi-2024-B03',
      administeredBy: vetId,
    },
  });

  await prisma.vaccination.create({
    data: {
      animalId: pip.id,
      vaccineName: 'Kattenziekte (Panleukopenie)',
      administeredDate: new Date('2023-03-20'),
      nextDueDate: new Date('2026-03-20'),
      batchNumber: 'FCV-2023-C07',
      administeredBy: vetId,
    },
  });

  await prisma.vaccination.create({
    data: {
      animalId: max.id,
      vaccineName: 'Hondsdolheid (Rabiës)',
      administeredDate: new Date('2023-11-05'),
      nextDueDate: new Date('2026-11-05'),
      batchNumber: 'RB-2023-A09',
      administeredBy: vetId,
    },
  });

  await prisma.vaccination.create({
    data: {
      animalId: max.id,
      vaccineName: 'Leptospirose',
      administeredDate: new Date('2024-11-05'),
      nextDueDate: new Date('2025-11-05'),
      batchNumber: 'LEPTO-2024-D02',
      administeredBy: vetId,
    },
  });

  await prisma.vaccination.create({
    data: {
      animalId: simba.id,
      vaccineName: 'Kattenziekte (Panleukopenie)',
      administeredDate: new Date('2024-08-15'),
      nextDueDate: new Date('2027-08-15'),
      batchNumber: 'FCV-2024-C12',
      administeredBy: vetId,
    },
  });

  await prisma.vaccination.create({
    data: {
      animalId: simba.id,
      vaccineName: 'Feline leukemie (FeLV)',
      administeredDate: new Date('2024-08-15'),
      nextDueDate: new Date('2025-08-15'),
      batchNumber: 'FELV-2024-E05',
      administeredBy: vetId,
    },
  });

  await prisma.vaccination.create({
    data: {
      animalId: noor.id,
      vaccineName: 'Myxomatose / VHD combinatie',
      administeredDate: new Date('2024-04-01'),
      nextDueDate: new Date('2025-04-01'),
      batchNumber: 'MYX-2024-F01',
      administeredBy: vetId,
    },
  });

  console.log('Database seeded successfully.');
  console.log('Created 3 owners, 5 animals, 5 patient identifiers, 8 vaccinations.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
