import mongoose, { Schema } from 'mongoose';
import { SEVERITIES } from '@lib/constants';
import { IMedicalCase } from '@mytypes/MedicalCase';

export const medicalCaseMSchema = new Schema<IMedicalCase>(
   {
      diagnosis: {
         type: String,
         ref: 'Diagnosis',
         required: true,
      },
      condition: { type: String, required: true },
      severity: {
         type: String,
         enum: Object.values(SEVERITIES),
         required: true,
      },
      startDate: { type: Date, required: true },
      endDate: {
         type: Date,
         required: false,
         default: null,
         validate: {
            validator: val =>
               val !== undefined && (val === null || val instanceof Date),
            message: 'endDate must be a Date or null (and not missing)',
         },
      },
      diagnosedBy: {
         type: String,
         ref: 'Doctor',
         required: true,
      },
      treatment: { type: String, required: false },
      relatedConditions: { type: [String], required: true },
      notes: { type: String, required: false },
   },
   { timestamps: true, _id: false }
);

export const MedicalCaseModel = mongoose.model<IMedicalCase>(
   'MedicalCase',
   medicalCaseMSchema
);
