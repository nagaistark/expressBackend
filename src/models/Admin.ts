import { Schema, model } from 'mongoose';
import { IAdmin } from '@mytypes/Admin';
import { isValidNANPPhoneNumber } from '@validators/mongoose/isValidNANPPhoneNumber';
import { GENDERS } from '@lib/constants';
import { addressMSchema } from '@models/Address';
import { isAgeWithinRange } from '@lib/age';

export const adminMSchema = new Schema<IAdmin>(
   {
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
      role: { type: String, required: true },
   },
   { timestamps: true, optimisticConcurrency: true }
);

export const AdminModel = model<IAdmin>('Admin', adminMSchema);
