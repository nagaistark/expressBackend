import { Router } from 'express';
import { DoctorModel } from '@models/Doctor';
import { IDoctor } from '@mytypes/Doctor';

import { deleteById, deleteAll } from '@controllers/common/deleteController';
import { getById, getAll } from '@controllers/common/readController';
import { createOne, createMany } from '@controllers/common/createController';
import { updateById, updateMany } from '@controllers/common/updateController';

import { validateBody } from '@middleware/validateBody';
import { CreateDoctorVSchema } from '@schemas/Doctor';

const router = Router();

router.get('/:id', getById<IDoctor>(DoctorModel));
router.get('/', getAll<IDoctor>('doctor'));

router.post(
   '/',
   validateBody(CreateDoctorVSchema),
   createOne<IDoctor>(DoctorModel)
);
router.post('/many', createMany<IDoctor>(DoctorModel));

router.patch('/:id', updateById<IDoctor>(DoctorModel));
router.patch('/', updateMany<IDoctor>(DoctorModel));

router.delete('/:id', deleteById<IDoctor>(DoctorModel));
router.delete('/', deleteAll<IDoctor>(DoctorModel));

export default router;
