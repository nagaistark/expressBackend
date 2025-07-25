import { AllergenModel } from '@models/Allergen';
import { DiagnosisModel } from '@models/Diagnosis';
import { VaccineModel } from '@models/Vaccine';
import { DoctorModel } from '@models/Doctor';
import { PatientModel } from '@models/Patient';
import { ValidTypedModelReference } from '@utils/validModelReference';

export const ValidDoctorReference = ValidTypedModelReference(
   DoctorModel,
   'doctor'
);

export const ValidVaccineReference = ValidTypedModelReference(
   VaccineModel,
   'vaccine'
);

export const ValidDiagnosisReference = ValidTypedModelReference(
   DiagnosisModel,
   'diagnosis'
);

export const ValidAllergenReference = ValidTypedModelReference(
   AllergenModel,
   'allergen'
);

export const ValidPatientReference = ValidTypedModelReference(
   PatientModel,
   'patient'
);
