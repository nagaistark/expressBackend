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
} from 'valibot';

import { ValidatePhone } from '@validators/valibot/ValidatePhone';
import { ValidateDOB } from '@lib/age';
import { AddressVSchema } from '@schemas/Address';
import { GenderVSchema } from '@schemas/Gender';
import { TypeSafeArrayKeys } from '@utils/validateArrayKeys';

export const CreateAdminVSchema = strictObjectAsync({
   kind: literal('admin'),
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
   email: optional(pipe(string(), trim(), email())),
   address: AddressVSchema,
   role: pipe(string(), trim(), minLength(1, 'Role is required (Valibot)')),
});

export type CreateAdminOutput = InferOutput<typeof CreateAdminVSchema>;
