import { Router } from 'express';
import patientRoutes from '@routes/v1/patientRoutes';
const v1: Router = Router();

v1.use('/patients', patientRoutes);
export default v1;
