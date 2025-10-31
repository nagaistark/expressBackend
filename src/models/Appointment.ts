import { Schema, model } from 'mongoose';
import { APP_STATUS, IAppointment } from '@/schemas-n-types/Appointment';

export const appointmentSchema = new Schema<IAppointment>(
   {
      patientId: {
         type: Schema.Types.ObjectId,
         ref: 'Patient',
         required: true,
      },
      doctorId: {
         type: Schema.Types.ObjectId,
         ref: 'Doctor',
         required: true,
      },
      date: { type: Date, required: true },
      flexTime: { type: Boolean, required: true },
      noDocPref: { type: Boolean, required: true },
      status: {
         type: String,
         enum: Object.values(APP_STATUS),
         required: true,
      },
      clinicalNote: {
         type: String,
         required: true,
      },
   },
   { timestamps: true }
);

export const AppointmentModel = model<IAppointment>(
   'Appointment',
   appointmentSchema
);
