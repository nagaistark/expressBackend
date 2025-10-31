import {
   pipe,
   strictObject,
   union,
   literal,
   check,
   parse,
   type BaseSchema,
} from 'valibot';

const enumUnion = <T extends readonly string[]>(arr: T) => {
   return union(
      arr.map(item => literal(item)),
      `Must be one of the ${arr.join(', ')} (valibot)`
   );
};

export const encounterVSchema = strictObject({
   placeholder: literal('example'),
});

const appointmentStatuses = [
   'booked',
   'cancelled',
   'no-show',
   'completed',
] as const;

export const appointmentStatus = enumUnion(appointmentStatuses);

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
      status: appointmentStatus,
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

const mockRequest = {
   status: 'completed',
   encounter: { placeholder: 'example' },
};

try {
   console.log(parse(appointmentVSchema, mockRequest));
} catch (err) {
   console.log(err);
}
