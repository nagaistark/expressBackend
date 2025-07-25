import { Schema } from 'mongoose';
import { IAllergyCase } from '@mytypes/AllergyCase';
import { SEVERITIES } from '@lib/constants';

export const allergyCaseMSchema = new Schema<IAllergyCase>(
   {
      substance: {
         type: String,
         ref: 'Allergen',
         required: true,
      },
      reaction: { type: String, required: true },
      severity: {
         type: String,
         enum: Object.values(SEVERITIES),
         required: true,
      },
      diagnosedDate: { type: Date, required: false },
      treatment: { type: String, required: false },
      notes: { type: String, required: false },
   },
   { _id: false }
);
