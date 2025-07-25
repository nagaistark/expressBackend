import {
   strictObject,
   pipe,
   string,
   minLength,
   literal,
   InferOutput,
} from 'valibot';

export const CreateAllergenVSchema = strictObject({
   kind: literal('allergen'),
   name: pipe(string(), minLength(1, 'Allergen name is required (Valibot)')),
});

export type CreateAllergenOutput = InferOutput<typeof CreateAllergenVSchema>;
