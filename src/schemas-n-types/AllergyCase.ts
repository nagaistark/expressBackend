import {
   strictObjectAsync,
   optional,
   picklist,
   string,
   trim,
   pipe,
   minLength,
   InferOutput,
} from 'valibot';
import { SEVERITIES } from '@lib/constants';
import { validateDateField } from '@utils/validateDateField';
import { ValidAllergenReference } from '@/schemas-n-types/ValidModelRefs';

export const CreateAllergyCaseVSchema = strictObjectAsync({
   substance: ValidAllergenReference,
   reaction: pipe(
      string(),
      trim(),
      minLength(1, 'Reaction is required (Valibot)')
   ),
   severity: picklist(Object.values(SEVERITIES)),
   diagnosedDate: optional(validateDateField('Date diagnosed')),
   treatment: optional(string()),
   notes: optional(string()),
});

export type IAllergyCase = InferOutput<typeof CreateAllergyCaseVSchema>;
