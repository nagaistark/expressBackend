import { pipeAsync, customAsync, string } from 'valibot';
import { isValidObjectId, Model } from 'mongoose';

const isStrictObjectId = (val: string) => /^[a-fA-F0-9]{24}$/.test(val);

// Make sure that `ObjectId` belongs to the right Model (when being referenced in a parent schema)
export function ValidTypedModelReference<T extends { kind: string }>(
   model: Model<T>,
   kind: T['kind'],
   modelName = model.modelName
) {
   return pipeAsync(
      string(),
      customAsync(val => {
         return typeof val === 'string';
      }, `[${modelName}] Validation failed: not a string.`),

      customAsync(val => {
         return isValidObjectId(val);
      }, `[${modelName}] Validation failed: invalid ObjectId.`),

      customAsync(async val => {
         try {
            const exists = await model.exists({ _id: val, kind });
            return !!exists;
         } catch (err) {
            console.error(
               `[${modelName}] DB error during reference check`,
               err
            );
            return false;
         }
      }, `Invalid ${modelName} reference — must exist and be of kind "${kind}"`)
   );
}
