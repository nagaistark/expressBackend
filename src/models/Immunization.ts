import { Schema, model } from 'mongoose';
import { IAdministeredBy, IImmunization } from '@mytypes/Immunization';

const administeredBySchema = new Schema(
   {
      doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
      externalName: { type: String },
   },
   {
      _id: false,
      validate: {
         validator: function (value: IAdministeredBy) {
            if (!value) return true; // case 3: field omitted
            const hasDoctor = !!value.doctorId;
            const hasExternal = !!value.externalName;
            return (hasDoctor || hasExternal) && !(hasDoctor && hasExternal);
         },
         message:
            'administeredBy must contain either doctorId or externalName, but not both.',
      },
   }
);

export const immunizationCaseMSchema = new Schema<IImmunization>({
   vaccine: { type: String, ref: 'Vaccine', required: true },
   dateAdministered: { type: Date, required: true },
   nextDoseDue: { type: Date, required: false, default: null },
   administeredBy: {
      type: administeredBySchema,
      required: false,
   },
   notes: { type: String, required: false },
});

export const ImmunizationModel = model('Immunization', immunizationCaseMSchema);
