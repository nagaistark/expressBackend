import { Types } from 'mongoose';
import { BloodTypes, Severity, Gender } from '@lib/constants';
import { IAddress } from '@mytypes/Address';
import { IAllergyCase } from '@mytypes/AllergyCase';
import { IMedicalCase } from '@mytypes/MedicalCase';

import {
   CreateClinicalFormOutput,
   CreatePatientOutput,
} from '@schemas/Patient';

export type AdministeredBy =
   | { doctorId: Types.ObjectId; externalName?: never }
   | { doctorId?: never; externalName: string };

export interface IImmunization {
   vaccine: Types.ObjectId;
   dateAdministered: Date;
   nextDoseDue?: Date | null;
   administeredBy?: AdministeredBy;
   notes?: string;
}

export interface IEmergencyContact {
   name: string;
   relation: string;
   phone: string;
   address?: IAddress;
}

/* export interface IClinicalForm {
   bloodType: BloodTypes;
   allergies: IAllergyCase[];
   immunizations: IImmunization[];
   medicalHistory: IMedicalCase[];
   emergencyContacts: IEmergencyContact[];
} */

export type IClinicalForm = CreateClinicalFormOutput;

/* export interface IPatient {
   intake: IIntakeForm;
   clinical: IClinicalForm;
   verified: boolean;
} */

export type IPatient = CreatePatientOutput;
