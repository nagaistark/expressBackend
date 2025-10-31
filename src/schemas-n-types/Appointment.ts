import { Types } from 'mongoose';

export const APP_STATUS = {
   SCHEDULED: 'scheduled',
   COMPLETED: 'completed',
   CANCELLED: 'cancelled',
} as const;

export type AppointmentStatusValues =
   (typeof APP_STATUS)[keyof typeof APP_STATUS];

export interface IAppointment {
   patientId: Types.ObjectId;
   doctorId: Types.ObjectId;
   date: Date;
   flexTime: boolean;
   noDocPref: boolean;
   status: AppointmentStatusValues;
   clinicalNote: string;
}
