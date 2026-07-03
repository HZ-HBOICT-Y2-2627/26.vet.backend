import { z } from 'zod';
import { ReminderChannel, Species, Sex } from '../generated/prisma/enums';

export const createOwnerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  reminderChannel: z.nativeEnum(ReminderChannel),
  gdprConsent: z.boolean(),
  gdprConsentDate: z.coerce.date(),
});

export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;

export const createAnimalSchema = z.object({
  ownerId: z.string().uuid(),
  name: z.string().min(1),
  species: z.nativeEnum(Species),
  breed: z.string().min(1).optional(),
  dateOfBirth: z.coerce.date(),
  sex: z.nativeEnum(Sex),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;

export const updateAnimalSchema = createAnimalSchema.partial();

export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
