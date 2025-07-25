import {
   strictObjectAsync,
   pipe,
   string,
   trim,
   minLength,
   optional,
   InferOutput,
} from 'valibot';
import { ValidatePhone } from '@validators/valibot/ValidatePhone';
import { AddressVSchema } from '@schemas/Address';

export const CreateEmergencyContactVSchema = strictObjectAsync({
   name: pipe(string(), trim(), minLength(1, 'Name is required (Valibot)')),
   relation: pipe(
      string(),
      trim(),
      minLength(1, 'Relation is required (Valibot)')
   ),
   phone: ValidatePhone,
   address: optional(AddressVSchema),
});

export type EmergencyContactOutput = InferOutput<
   typeof CreateEmergencyContactVSchema
>;
