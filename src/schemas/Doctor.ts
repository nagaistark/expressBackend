import {
   string,
   trim,
   optional,
   pipe,
   minLength,
   email,
   InferOutput,
   literal,
   strictObjectAsync,
   fallbackAsync,
} from 'valibot';

import { ValidatePhone } from '@validators/valibot/ValidatePhone';
import { ValidateDOB } from '@lib/age';
import { AddressVSchema } from '@schemas/Address';
import { GenderVSchema } from '@schemas/Gender';

export const CreateDoctorVSchema = strictObjectAsync({
   kind: literal('doctor'),
   firstName: pipe(
      string(),
      trim(),
      minLength(1, 'First name is required (Valibot)')
   ),
   lastName: pipe(
      string(),
      trim(),
      minLength(1, 'Last name is required (Valibot)')
   ),
   gender: GenderVSchema,
   dateOfBirth: ValidateDOB,
   phone: ValidatePhone,
   email: optional(pipe(string(), email())),
   address: AddressVSchema,
   specialty: pipe(
      string(),
      trim(),
      minLength(1, 'Specialty is required (Valibot)')
   ),
});

export type CreateDoctorOutput = InferOutput<typeof CreateDoctorVSchema>;
