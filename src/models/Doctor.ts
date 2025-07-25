import { Schema, model } from 'mongoose';
import { IDoctor } from '@mytypes/Doctor';

import { GENDERS } from '@lib/constants';
import { isAgeWithinRange } from '@lib/age';
import { addressMSchema } from '@models/Address';
import { isValidNANPPhoneNumber } from '@validators/mongoose/isValidNANPPhoneNumber';

export const doctorMSchema = new Schema<IDoctor>(
   {
      kind: {
         type: String,
         required: true,
         default: 'doctor',
         immutable: true,
      },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      gender: { type: String, enum: Object.values(GENDERS), required: true },
      dateOfBirth: {
         type: Date,
         required: true,
         immutable: true,
         validate: {
            validator: dob => isAgeWithinRange(dob),
            message: 'Age must be within the range',
         },
      },
      phone: {
         type: String,
         required: true,
         unique: true,
         validate: {
            validator: isValidNANPPhoneNumber,
            message: 'Wrong phone number format',
         },
      },
      address: { type: addressMSchema, required: true },
      specialty: { type: String, required: true },
   },
   { timestamps: true, optimisticConcurrency: true }
);

export const DoctorModel = model('Doctor', doctorMSchema);
