import { Schema, model } from 'mongoose';
import { IDiagnosis } from '@/schemas-n-types/Diagnosis';

const diagnosisMSchema = new Schema<IDiagnosis>({
   kind: {
      type: String,
      required: true,
      default: 'diagnosis',
      immutable: true,
   },
   name: { type: String, required: true },
   description: { type: String, required: true },
});

export const DiagnosisModel = model('Diagnosis', diagnosisMSchema);
