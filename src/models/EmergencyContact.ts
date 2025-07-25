import { Schema } from 'mongoose';
import { addressMSchema } from '@models/Address';
import { IEmergencyContact } from '@mytypes/EmergencyContact';

export const emergencyContactMSchema = new Schema<IEmergencyContact>(
   {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: addressMSchema, required: false },
   },
   { _id: false }
);
