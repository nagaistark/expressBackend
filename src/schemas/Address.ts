import {
   object,
   pipe,
   string,
   minLength,
   optional,
   trim,
   custom,
   InferOutput,
} from 'valibot';
import { isValidCanadianPostalCode } from '@utils/isValidCanadianPostalCode';

export const AddressVSchema = object({
   street: pipe(string(), minLength(1, 'Street is required (Valibot)')),
   city: pipe(string(), minLength(1, 'City is required (Valibot)')),
   province: pipe(string(), minLength(1, 'Province is required (Valibot)')),
   postalCode: optional(
      pipe(
         string(),
         trim(),
         custom(
            isValidCanadianPostalCode,
            'Invalid canadian postal code format'
         )
      )
   ),
});

export type AddressOutput = InferOutput<typeof AddressVSchema>;
