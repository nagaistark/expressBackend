import { Router } from 'express';
import { PatientModel } from '@models/Patient';
import { IPatient } from '@schemas/Patient';

import { deleteById, deleteAll } from '@controllers/common/deleteController';
import { getById, getAll } from '@controllers/common/readController';
import { createOne, createMany } from '@controllers/common/createController';
import { updateById, updateMany } from '@controllers/common/updateController';

import { validateBody } from '@middleware/validateBody';
import { CreatePatientVSchema } from '@/schemas-n-types/Patient';
import { ensurePreferredDoctorDefault } from '@middleware/ensurePreferredDoctorDefault';

const patientRoutes = Router();

patientRoutes.get('/:id', getById<IPatient>(PatientModel));
patientRoutes.get('/', getAll<IPatient>('patients'));

patientRoutes.post(
   '/',
   ensurePreferredDoctorDefault, // Mutates req.body if doctor is missing
   validateBody(CreatePatientVSchema), // Parses and sanitizes input → res.locals.validatedInput (immutable)
   createOne<IPatient>(PatientModel) // Uses res.locals.validatedInput to save to DB
);
patientRoutes.post('/many', createMany<IPatient>(PatientModel));

patientRoutes.patch('/:id', updateById<IPatient>(PatientModel));
patientRoutes.patch('/', updateMany<IPatient>(PatientModel));

patientRoutes.delete('/:id', deleteById<IPatient>(PatientModel));
patientRoutes.delete('/', deleteAll<IPatient>(PatientModel));

export default patientRoutes;
