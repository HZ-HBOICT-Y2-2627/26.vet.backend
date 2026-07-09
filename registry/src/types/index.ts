import { ReminderChannel, Species, Sex } from '../generated/prisma/client';

export type { ReminderChannel, Species, Sex };

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  reminderChannel: ReminderChannel;
  createdAt: Date;
}

export interface ConsentRecord {
  id: string;
  ownerId: string;
  granted: boolean;
  consentDate: Date;
  createdAt: Date;
}

export interface Animal {
  id: string;
  ownerId: string;
  name: string;
  species: Species;
  breed: string | null;
  dateOfBirth: Date;
  sex: Sex;
  createdAt: Date;
  deleted: boolean;
  deletedAt: Date | null;
}

export interface PatientIdentifier {
  id: string;
  animalId: string;
  chipNumber: string | null;
  vetbaseRecordId: string | null;
  labAccessionNumber: string | null;
  createdAt: Date;
}

export interface Vaccination {
  id: string;
  animalId: string;
  vaccineName: string;
  administeredDate: Date;
  nextDueDate: Date | null;
  batchNumber: string | null;
  administeredBy: string;
  createdAt: Date;
}

export interface OwnerWithAnimals extends Owner {
  animals: AnimalWithRelations[];
  consentRecords: ConsentRecord[];
}

export interface AnimalWithRelations extends Animal {
  owner?: Owner;
  patientIdentifier?: PatientIdentifier | null;
  vaccinations?: Vaccination[];
}
