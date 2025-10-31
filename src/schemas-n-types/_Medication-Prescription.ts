import {
   strictObject,
   array,
   union,
   regex,
   pipe,
   optional,
   literal,
   check,
} from 'valibot';
import {
   baseString,
   positiveInteger,
   idOrName,
   dateInThePastOrOptionallyToday,
} from '@schemas/__helpers.ts';
import {
   medicationForm,
   medicationRoute,
   medicationSource,
   medicationStatus,
   medicationStatuses,
} from '@ssot/constants.ts';
import { DateTime } from 'luxon';

type MedicationStatus = (typeof medicationStatuses)[number];
type MedStatusConsistencyConfig = {
   needsStart: boolean;
   needsEnd: boolean;
};

export const medicationStatusesConsistency: Record<
   MedicationStatus,
   MedStatusConsistencyConfig
> = {
   active: { needsStart: true, needsEnd: false },
   completed: { needsStart: true, needsEnd: true },
   discontinued: { needsStart: true, needsEnd: true },
};

const strengthOrDose = pipe(
   baseString,
   regex(
      /^\d+(\.\d+)?\s?(mg|g|mcg|mL)$/i,
      'Must be a number followed by a unit (mg, g, mcg, mL)'
   )
);

export const _medVSchema = pipe(
   strictObject({
      medicationName: baseString,
      strength: strengthOrDose,
      form: medicationForm,
      route: medicationRoute,
      dose: strengthOrDose,
      quantity: optional(positiveInteger),
      instructions: baseString,
      startDate: optional(dateInThePastOrOptionallyToday),
      endDate: optional(dateInThePastOrOptionallyToday),
      status: medicationStatus,
      prescribedBy: optional(idOrName),
      source: medicationSource,
      notes: optional(baseString),
   }),
   // Status/Dates Consistency
   check(obj => {
      const statusDefinition =
         medicationStatusesConsistency[obj.status as MedicationStatus];
      if (!statusDefinition) return false;
      const hasStart = !!obj.startDate;
      const hasEnd = !!obj.endDate;

      return (
         (!statusDefinition.needsStart || hasStart) &&
         (!statusDefinition.needsEnd || hasEnd) &&
         (statusDefinition.needsEnd || !hasEnd)
      );
   }, 'Status must be consistent with startDate/endDate'),
   // Chronological validation
   check(obj => {
      if (obj.startDate && obj.endDate) {
         const start = DateTime.fromJSDate(obj.startDate);
         const end = DateTime.fromJSDate(obj.endDate);
         return end >= start;
      }
      return true;
   }, 'The end date must not happen before the start date (valibot)')
);

export const _prescriptionVSchema = pipe(
   strictObject({
      ..._medVSchema.entries,
      refillsAllowed: optional(positiveInteger),
      refillsUsed: optional(positiveInteger),
      renewals: optional(
         array(
            pipe(
               strictObject({
                  requested: strictObject({
                     on: dateInThePastOrOptionallyToday,
                     by: union([literal('patient'), literal('pharmacy')]),
                  }),

                  approved: optional(
                     strictObject({
                        on: dateInThePastOrOptionallyToday,
                        by: idOrName,
                     })
                  ),

                  denied: optional(
                     strictObject({
                        on: dateInThePastOrOptionallyToday,
                        by: idOrName,
                     })
                  ),

                  reason: optional(baseString),
               }),
               check(obj => {
                  const hasApproval = !!obj.approved;
                  const hasDenial = !!obj.denied;

                  if (!hasApproval && !hasDenial) return true; // pending

                  if (hasApproval && !hasDenial) {
                     return (
                        !!obj.approved && !!obj.approved.on && !!obj.approved.by
                     );
                  }

                  if (hasDenial && !hasApproval) {
                     return !!obj.denied && !!obj.denied.on && !!obj.denied.by;
                  }

                  return false; // both "approved" and "denied" present
               }, 'Renewal cannot be both approved and denied (valibot)')
            )
         )
      ),
   }),
   check(obj => {
      if (obj.refillsUsed && !obj.refillsAllowed) return false;
      if (obj.refillsAllowed && obj.refillsUsed) {
         return obj.refillsUsed <= obj.refillsAllowed;
      }
      return true;
   }, 'Refills consistency check failed (valibot)')
);
