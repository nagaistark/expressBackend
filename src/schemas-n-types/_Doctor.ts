import { Schema, model } from 'mongoose';
import {
   InferOutput,
   literal,
   minLength,
   pipe,
   strictObject,
   string,
   trim,
} from 'valibot';

const _CreateDoctorVSchema = strictObject({
   title: literal('doctor'),
   firstName: pipe(
      string('Must be a string (valibot)'),
      trim(),
      minLength(1, '')
   ),
   lastName: pipe(
      string('Must be a string (valibot)'),
      trim(),
      minLength(1, '')
   ),
});

type IDoctor = InferOutput<typeof _CreateDoctorVSchema>;

const _DoctorMSchema = new Schema<IDoctor>(
   {
      title: {
         type: String,
         required: true,
         default: 'doctor',
         immutable: true,
      },
      firstName: {
         type: String,
         required: true,
      },
      lastName: {
         type: String,
         required: true,
      },
   },
   { timestamps: true, optimisticConcurrency: true }
);

export const _DoctorModel = model('Doctor', _DoctorMSchema);
