import mongoose from 'mongoose';

import { Router } from 'express';
import { PatientModel } from '@models/Patient';
import { IPatient } from '@mytypes/Patient';

import { deleteById, deleteAll } from '@controllers/common/deleteController';
import { getById, getAll } from '@controllers/common/readController';
import { createOne, createMany } from '@controllers/common/createController';
import { updateById, updateMany } from '@controllers/common/updateController';

import { validateBody } from '@middleware/validateBody';
import { CreatePatientVSchema } from '@schemas/Patient';
import { ensurePreferredDoctorDefault } from '@middleware/ensurePreferredDoctorDefault';

const router = Router();

router.get('/:id', getById<IPatient>(PatientModel));
router.get('/', getAll<IPatient>('patients'));

router.post(
   '/',
   ensurePreferredDoctorDefault, // Mutates req.body if doctor is missing
   // ensureClinicalDefault, // Mutates req.body if clinical is missing
   validateBody(CreatePatientVSchema), // Parses and sanitizes input → res.locals.validatedInput (immutable)
   createOne<IPatient>(PatientModel) // Uses res.locals.validatedInput to save to DB
);
router.post('/many', createMany<IPatient>(PatientModel));

router.post('/insert-test', async (req, res) => {
   const start = Date.now();
   await mongoose.connection.db?.collection('patients').insertOne(req.body);
   const total = Date.now() - start;
   res.json({ inserted: true, ms: total });
});

router.patch('/:id', updateById<IPatient>(PatientModel));
router.patch('/', updateMany<IPatient>(PatientModel));

router.delete('/:id', deleteById<IPatient>(PatientModel));
router.delete('/', deleteAll<IPatient>(PatientModel));

export default router;
