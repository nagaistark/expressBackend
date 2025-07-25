import { ValidDoctorReference } from '@schemas/ValidModelRefs';
import {
   pipe,
   string,
   trim,
   minLength,
   never,
   optional,
   strictObjectAsync,
   unionAsync,
} from 'valibot';

export const DoctorIdOrExternal = unionAsync([
   strictObjectAsync({
      doctorId: ValidDoctorReference,
      externalName: optional(never()),
   }),
   strictObjectAsync({
      doctorId: optional(never()),
      externalName: pipe(
         string(),
         trim(),
         minLength(1, 'External name is required (Valibot)')
      ),
   }),
]);
