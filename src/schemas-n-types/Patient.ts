import {
   string,
   trim,
   arrayAsync,
   picklist,
   optional,
   pipe,
   pipeAsync,
   unionAsync,
   literal,
   minLength,
   email,
   InferOutput,
   strictObjectAsync,
   boolean,
   fallback,
   fallbackAsync,
   maxLength,
} from 'valibot';

import { BLOOD_TYPES, EMBEDDED_ARRAY_FIELDS } from '@lib/constants';
import { ValidatePhone } from '@validators/valibot/ValidatePhone';
import { ValidateDOB } from '@lib/age';
import { AddressVSchema } from '@/schemas-n-types/Address';
import { GenderVSchema } from '@/schemas-n-types/Gender';
import { CreateAllergyCaseVSchema } from '@/schemas-n-types/AllergyCase';
import { CreateImmunizationVSchema } from '@/schemas-n-types/Immunization';
import { CreateMedicalCaseVSchema } from '@/schemas-n-types/MedicalCase';
import { CreateEmergencyContactVSchema } from '@/schemas-n-types/EmergencyContact';
import { DoctorModel } from '@models/Doctor';
import { ValidTypedModelReference } from '@utils/validModelReference';
import {
   TypeSafeArrayKeys,
   verifyArrayKeySync,
} from '@utils/validateArrayKeys';
import { extractArrayFields } from '@utils/extractArrayFields';

const PreferredDoctorVSchema = unionAsync(
   [ValidTypedModelReference(DoctorModel, 'doctor'), literal('unspecified')],
   'Preferred doctor must be a valid doctor ID or "unspecified".'
);

export const CreatePatientVSchema = strictObjectAsync({
   kind: literal('patient'),
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
   doctor: PreferredDoctorVSchema,

   bloodType: fallback(picklist(Object.values(BLOOD_TYPES)), 'unknown'),
   allergies: fallbackAsync(arrayAsync(CreateAllergyCaseVSchema), []),
   immunizations: fallbackAsync(arrayAsync(CreateImmunizationVSchema), []),
   medicalHistory: fallbackAsync(arrayAsync(CreateMedicalCaseVSchema), []),
   emergencyContacts: fallbackAsync(
      pipeAsync(
         arrayAsync(CreateEmergencyContactVSchema),
         maxLength(3, 'The Emergency Contacts array must not exceed 3 elements')
      ),
      []
   ),
   verified: boolean('Boolean is required (Valibot)'),
});

export type CreatePatientOutput = InferOutput<typeof CreatePatientVSchema>;

export const CreatePatient_HCArrayKeys: TypeSafeArrayKeys<CreatePatientOutput>[] =
   ['allergies', 'immunizations', 'medicalHistory'];

export type IPatient = InferOutput<typeof CreatePatientVSchema>;
