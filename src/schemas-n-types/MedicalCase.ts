import {
   string,
   trim,
   strictObjectAsync,
   array,
   maxValue,
   picklist,
   optional,
   pipe,
   minLength,
   maxLength,
   InferOutput,
} from 'valibot';
import { SEVERITIES } from '@lib/constants';
import { validateDateField } from '@utils/validateDateField';
import {
   ValidDoctorReference,
   ValidDiagnosisReference,
} from '@/schemas-n-types/ValidModelRefs';

export const CreateMedicalCaseVSchema = strictObjectAsync({
   diagnosis: ValidDiagnosisReference,
   condition: pipe(
      string(),
      trim(),
      minLength(1, 'Condition is required (Valibot)')
   ),
   severity: picklist(Object.values(SEVERITIES)),
   startDate: pipe(validateDateField('Start date'), maxValue(new Date())),
   endDate: optional(pipe(validateDateField('End date'), maxValue(new Date()))),
   diagnosedBy: ValidDoctorReference,
   treatment: optional(string()),
   relatedConditions: optional(
      pipe(
         array(string()),
         maxLength(
            3,
            'The Related Conditions array must not exceed 10 elements'
         )
      )
   ),
   notes: optional(string()),
});

export type IMedicalCase = InferOutput<typeof CreateMedicalCaseVSchema>;
