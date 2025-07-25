import { Schema, model } from 'mongoose';
import { IAllergen } from '@mytypes/Allergen';

export const allergenSchema = new Schema<IAllergen>({
   kind: { type: String, required: true, default: 'allergen', immutable: true },
   name: { type: String, required: true, unique: true },
});

export const AllergenModel = model('Allergen', allergenSchema);
