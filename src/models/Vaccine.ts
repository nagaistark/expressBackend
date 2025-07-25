import { Schema, model } from 'mongoose';
import { IVaccine } from '@mytypes/Vaccine';

const vaccineSchema = new Schema<IVaccine>({
   kind: { type: String, required: true, default: 'vaccine', immutable: true },
   name: { type: String, required: true },
   purpose: { type: String, required: true },
});

export const VaccineModel = model('Vaccine', vaccineSchema);
