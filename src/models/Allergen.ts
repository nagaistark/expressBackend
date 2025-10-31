import { Schema, model } from 'mongoose';
import { IAllergen } from '@/schemas-n-types/Allergen';

export const allergenSchema = new Schema<IAllergen>({
   kind: { type: String, required: true, default: 'allergen', immutable: true },
   name: { type: String, required: true, unique: true },
});

export const AllergenModel = model('Allergen', allergenSchema);
