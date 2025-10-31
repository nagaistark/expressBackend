import {
   strictObject,
   pipe,
   string,
   trim,
   minLength,
   literal,
   InferOutput,
} from 'valibot';

export const CreateDiagnosisVSchema = strictObject({
   kind: literal('diagnosis'),
   name: pipe(
      string(),
      trim(),
      minLength(1, 'Diagnosis name is required (Valibot)')
   ),
   description: pipe(
      string(),
      trim(),
      minLength(1, 'Diagnosis description is required (Valibot)')
   ),
});

export type IDiagnosis = InferOutput<typeof CreateDiagnosisVSchema>;
