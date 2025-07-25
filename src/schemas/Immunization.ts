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
import { DoctorIdOrExternal } from '@/schemas/DoctorOrExternal';
import { ValidVaccineReference } from '@schemas/ValidModelRefs';

export const CreateImmunizationVSchema = strictObjectAsync({
   vaccine: ValidVaccineReference,
   dateAdministered: validateDateField('Date administered'),
   nextDoseDue: optional(nullable(validateDateField('Next dose due'))),
   administeredBy: optionalAsync(DoctorIdOrExternal),
   notes: optional(string()),
});

export type CreateImmunizationOutput = InferOutput<
   typeof CreateImmunizationVSchema
>;
