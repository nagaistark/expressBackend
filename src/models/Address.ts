import { Schema } from 'mongoose';
import { IAddress } from '@mytypes/Address';
import { isValidCanadianPostalCode } from '@utils/isValidCanadianPostalCode';

export const addressMSchema = new Schema<IAddress>(
   {
      street: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: {
         type: String,
         required: false,
         validate: {
            validator: isValidCanadianPostalCode,
            message: 'Wrong postal code format',
         },
      },
   },
   { _id: false }
);
