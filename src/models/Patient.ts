import { Schema, model, isValidObjectId } from 'mongoose';
import { isAgeWithinRange } from '@lib/age';
import { isValidEmail } from '@lib/phone-n-email';
import { isValidNANPPhoneNumber } from '@validators/mongoose/isValidNANPPhoneNumber';
import { GENDERS, BLOOD_TYPES } from '@lib/constants';
import { addressMSchema } from '@models/Address';
import { allergyCaseMSchema } from '@models/AllergyCase';
import { immunizationCaseMSchema } from '@models/Immunization';
import { medicalCaseMSchema } from '@models/MedicalCase';
import { emergencyContactMSchema } from '@models/EmergencyContact';

import { IPatient } from '@mytypes/Patient';

export const patientMSchema = new Schema<IPatient>(
   {
      kind: {},
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      gender: {
         type: String,
         enum: Object.values(GENDERS),
         default: 'other',
         required: true,
      },
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
         sparse: false,
         validate: {
            validator: isValidNANPPhoneNumber,
            message: 'Wrong phone number format',
         },
      },
      email: {
         type: String,
         required: false,
         unique: true,
         sparse: true,
         validate: {
            validator: isValidEmail,
            message: 'Wrong email format',
         },
      },
      address: { type: addressMSchema, required: true },
      doctor: {
         type: String,
         required: false,
         default: 'unspecified',
         validate: {
            validator: val => isValidObjectId(val) || val === 'unspecified',
            message: `Must be a valid ObjectId or "unspecified"`,
         },
      },

      bloodType: {
         type: String,
         enum: Object.values(BLOOD_TYPES),
         default: 'unknown',
         required: true,
      },
      allergies: {
         type: [allergyCaseMSchema],
         required: true,
         default: [],
      },
      immunizations: {
         type: [immunizationCaseMSchema],
         required: true,
         default: [],
      },
      medicalHistory: {
         type: [medicalCaseMSchema],
         required: true,
         default: [],
      },
      emergencyContacts: {
         type: [emergencyContactMSchema],
         required: true,
         default: [],
      },

      verified: { type: Boolean, required: true, default: false },
   },
   { timestamps: true, optimisticConcurrency: true }
);

export const PatientModel = model<IPatient>('Patient', patientMSchema);
