import {
   pipe,
   strictObjectAsync,
   string,
   unionAsync,
   optional,
   never,
   nullable,
   minLength,
   optionalAsync,
   InferOutput,
} from 'valibot';

import { validateDateField } from '@utils/validateDateField';
import { DoctorIdOrExternal } from '@/schemas-n-types/DoctorOrExternal';
import { ValidVaccineReference } from '@/schemas-n-types/ValidModelRefs';

export const CreateImmunizationVSchema = strictObjectAsync({
   vaccine: ValidVaccineReference,
   dateAdministered: validateDateField('Date administered'),
   nextDoseDue: optional(nullable(validateDateField('Next dose due'))),
   administeredBy: optionalAsync(DoctorIdOrExternal),
   notes: optional(string()),
});

export type IImmunization = InferOutput<typeof CreateImmunizationVSchema>;
export type IAdministeredBy = InferOutput<typeof DoctorIdOrExternal>;
