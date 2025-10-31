import { Router } from 'express';
import { DiagnosisModel } from '@models/Diagnosis';
import { IDiagnosis } from '@schemas/Diagnosis';
import { deleteById, deleteAll } from '@controllers/common/deleteController';
import { getById, getAll } from '@controllers/common/readController';
import { createOne, createMany } from '@controllers/common/createController';
import { updateById, updateMany } from '@controllers/common/updateController';

const router = Router();

router.get('/:id', getById<IDiagnosis>(DiagnosisModel));
router.get('/', getAll<IDiagnosis>('diagnoses'));

router.post('/', createOne<IDiagnosis>(DiagnosisModel));
router.post('/many', createMany<IDiagnosis>(DiagnosisModel));

router.patch('/:id', updateById<IDiagnosis>(DiagnosisModel));
router.patch('/', updateMany<IDiagnosis>(DiagnosisModel));

router.delete('/:id', deleteById<IDiagnosis>(DiagnosisModel));
router.delete('/', deleteAll<IDiagnosis>(DiagnosisModel));

export default router;
