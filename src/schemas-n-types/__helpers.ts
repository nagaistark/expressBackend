import { DateTime } from 'luxon';

import {
   strictObject,
   string,
   literal,
   pipe,
   trim,
   regex,
   transform,
   minValue,
   union,
   maxValue,
   maxLength,
   nonEmpty,
   custom,
   check,
   number,
   integer,
   array,
} from 'valibot';

import {
   timeZone,
   min_legal_age,
   provinceOrTerritory,
   typeOfPhone,
} from '@ssot/constants.ts';

export const baseString = pipe(
   string('Must be a string (valibot)'),
   trim(),
   nonEmpty('Must not be an empty string (valibot)'),
   maxLength(100, 'Must be reasonably long (valibot)')
);

export const positiveInteger = pipe(
   baseString,
   transform(val => parseInt(val, 10)),
   number('Must be a number (valibot)'),
   integer('Must be an integer (valibot)'),
   minValue(0, 'Must be a positive integer number (valibot)')
);

export const nameString = pipe(
   baseString,
   regex(
      /^[\p{L} .'\-’]+$/u,
      'Must not contain invalid characters in name (valibot)'
   )
);

export const objectIdFormatCheck = pipe(
   baseString,
   regex(/^[a-f\d]{24}$/i, 'Must be a valid ObjectId format (valibot)')
);

export const idOrName = union(
   [objectIdFormatCheck, nameString],
   'Must be either an ID or a name'
);

export const dateFromString = pipe(
   baseString,
   regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/,
      `Must be in either "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ" format (valibot)`
   ),
   check(input => {
      return DateTime.fromISO(input).isValid;
   }, 'Must be a valid calendar date (valibot)')
);

export const _validateExpiryDate = pipe(
   dateFromString,
   transform(input => {
      return DateTime.fromISO(input, { zone: timeZone }).endOf('day');
   }),
   check(expiryDateTime => {
      return expiryDateTime.toUTC() >= DateTime.utc();
   }, 'Card has expired (valibot)'),
   transform(expiryDateTime => expiryDateTime.toJSDate())
);

export const dateInTheFutureOrOptionallyToday = pipe(
   dateFromString,
   transform(input => {
      const fromIso = DateTime.fromISO(input, { zone: timeZone });
      const output = input.length === 10 ? fromIso.startOf('day') : fromIso;
      return output.toUTC();
   }),
   check(possiblyDateInTheFuture => {
      return possiblyDateInTheFuture > DateTime.utc();
   }, 'Date must be in the future (valibot)'),
   transform(definitelyDateInTheFuture => definitelyDateInTheFuture.toJSDate())
);

export const dateInThePastOrOptionallyToday = pipe(
   dateFromString,
   transform(input => {
      const fromIso = DateTime.fromISO(input, { zone: timeZone });
      const output = input.length === 10 ? fromIso.endOf('day') : fromIso;
      return output.toUTC();
   }),
   check(possiblyDateInThePast => {
      return possiblyDateInThePast < DateTime.utc();
   }, 'Date must be in the past (valibot)'),
   transform(definitelyDateInThePast => definitelyDateInThePast.toJSDate())
);

export const validateDOB = pipe(
   dateFromString,
   transform(input => {
      return DateTime.fromISO(input, { zone: timeZone }).startOf('day').toUTC();
   }),
   check(dob => {
      console.log(dob);
      const ofLegalAgeSince = dob.plus({ years: min_legal_age });
      console.log(ofLegalAgeSince);
      return DateTime.utc() >= ofLegalAgeSince;
   }, 'The patient must be of legal age (valibot)'),
   transform(dob => dob.toJSDate())
);

export const _validateCanadianPostalCode = pipe(
   baseString,
   regex(
      /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/i,
      'Invalid Canadian postal code format (valibot)'
   )
);

export const validateNANPPhoneNumber = pipe(
   baseString,
   transform(phone => phone.replace(/[^\d]/g, '')),
   regex(/^1?[2-9]\d{2}[2-9]\d{6}$/, 'Must be an NANP phone number (valibot)')
);

export const addressVSchema = pipe(
   array(
      strictObject({
         street: baseString,
         city: baseString,
         province: provinceOrTerritory,
         postalCode: _validateCanadianPostalCode,
         country: union(
            [literal('Canada'), literal('United States')],
            'Must be either Canada or United States (valibot)'
         ),
      })
   ),
   nonEmpty()
);

export const phoneVSchema = pipe(
   array(
      strictObject({
         type: typeOfPhone,
         number: validateNANPPhoneNumber,
      })
   ),
   nonEmpty()
);

export const emailVSchema = pipe(
   baseString,
   regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Must be a valid email (valibot)'
   )
);

export function rangedFloatW2Decimals({
   min,
   max,
   field,
}: {
   min: number;
   max: number;
   field: string;
}) {
   const label =
      field.length > 0
         ? field[0].toUpperCase() + field.slice(1).toLowerCase()
         : 'Field';
   return pipe(
      baseString,
      transform(str => parseFloat(str)),
      number('Must be a number (valibot)'),
      minValue(min, `${label} cannot be lower than ${min}`),
      maxValue(max, `${label} cannot be higher than ${max}`),
      custom<number>(val => {
         const decimals = (val as number).toString().split('.')[1];
         return !decimals || decimals.length <= 2;
      }, `${label} must have at most 2 decimal places (valibot)`)
   );
}
