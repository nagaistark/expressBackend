import {
   strictObject,
   pipe,
   array,
   nonEmpty,
   optional,
   check,
   union,
   literal,
   undefined_,
   type BaseSchema,
   type UndefinedSchema,
   type LiteralSchema,
} from 'valibot';
import {
   baseString,
   positiveInteger,
   dateInTheFutureOrOptionallyToday,
   objectIdFormatCheck,
   rangedFloatW2Decimals,
} from '@schemas/__helpers.ts';
import {
   appointmentStatus,
   appointmentStatuses,
   encounterStatus,
   encounterType,
   encounterVisitOption,
} from '@ssot/constants.ts';
import { _prescriptionVSchema } from './_Medication-Prescription';

export const encounterVSchema = pipe(
   strictObject({
      patientId: objectIdFormatCheck,
      providerId: pipe(
         array(objectIdFormatCheck, 'Must be an array (valibot)'),
         nonEmpty()
      ),
      appointmentId: objectIdFormatCheck,
      type: encounterType,
      startTime: dateInTheFutureOrOptionallyToday,
      endTime: dateInTheFutureOrOptionallyToday,
      status: encounterStatus,

      chiefComplaint: optional(baseString),
      notes: optional(baseString),

      diagnoses: optional(
         array(
            strictObject({
               code: baseString, // futher narrowing needed (ICD-10 or OHIP codes)
               description: baseString,
            })
         )
      ),
      vitals: optional(
         strictObject({
            bloodPressure: optional(
               strictObject({
                  systolic: positiveInteger,
                  diastolic: positiveInteger,
               })
            ),

            heartRate: optional(positiveInteger),
            respiratoryRate: optional(positiveInteger),
            temperatureC: optional(
               rangedFloatW2Decimals({ min: 30, max: 50, field: 'Temperature' })
            ),
            oxygenSaturation: optional(
               rangedFloatW2Decimals({
                  min: 0,
                  max: 100,
                  field: 'Oxygen saturation',
               })
            ),
            heightCm: optional(
               rangedFloatW2Decimals({
                  min: 0,
                  max: 300,
                  field: 'Height',
               })
            ),
            weightKg: optional(
               rangedFloatW2Decimals({
                  min: 0,
                  max: 200,
                  field: 'Weight',
               })
            ),
         })
      ),

      prescriptions: optional(array(_prescriptionVSchema)),

      visit: encounterVisitOption,
      isFollowUpOf: optional(objectIdFormatCheck),
   }),
   check(obj => {
      return true;
   }, '')
);

type AppointmentStatus = (typeof appointmentStatuses)[number];
const medicationStatusesConsistency: Record<
   AppointmentStatus,
   string | BaseSchema<any, any, any>
> = {
   booked: 'booked',
   cancelled: 'cancelled',
   'no-show': 'no-show',
   completed: encounterVSchema,
};

export const appointmentVSchema = pipe(
   strictObject({
      patientId: objectIdFormatCheck,
      providerId: objectIdFormatCheck,
      scheduledStart: dateInTheFutureOrOptionallyToday,
      scheduledEnd: dateInTheFutureOrOptionallyToday,
      status: appointmentStatus,
      reason: baseString,
      encounter: union(
         [
            literal('booked'),
            literal('cancelled'),
            literal('no-show'),
            encounterVSchema,
         ],
         'Must be one of the available options (valibot)'
      ),
   }),
   check(obj => {
      const expectedStatus =
         medicationStatusesConsistency[obj.status as AppointmentStatus];
      if (!expectedStatus) return false;
      if (typeof expectedStatus === 'object' && expectedStatus !== null) {
         return typeof obj.encounter === 'object' && obj.encounter !== null;
      }
      if (typeof expectedStatus === 'string') {
         return obj.encounter === expectedStatus;
      }
      return false;
   }, 'Encounter status does not match the appointment status (valibot)')
);
