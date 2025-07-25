import { pipe, string, minLength, regex, transform, date } from 'valibot';

export function validateDateField(fieldLabel = 'Date') {
   return pipe(
      string(`${fieldLabel} must be a string (Valibot)`),
      minLength(1, `${fieldLabel} is required (Valibot)`),
      regex(
         /^\d{4}-\d{2}-\d{2}$/,
         `${fieldLabel} must be in YYYY-MM-DD format (Valibot)`
      ),
      transform((s): Date => new Date(s)),
      date(`Invalid ${fieldLabel.toLowerCase()} (Valibot)`)
   );
}
