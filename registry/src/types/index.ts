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
  gdprConsent: boolean;
  gdprConsentDate: Date;
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
}

export interface AnimalWithRelations extends Animal {
  owner?: Owner;
  patientIdentifier?: PatientIdentifier | null;
  vaccinations?: Vaccination[];
}
