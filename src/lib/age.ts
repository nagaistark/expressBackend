import { pipe, custom } from 'valibot';
import { validateDateField } from '@utils/validateDateField';
import { LEGAL_AGE_MIN } from '@lib/constants';
import { LEGAL_AGE_MAX } from '@lib/constants';

export const isAgeWithinRange = (
   dob: unknown,
   min = LEGAL_AGE_MIN,
   max = LEGAL_AGE_MAX
): boolean => {
   if (!(dob instanceof Date) || isNaN(dob.getTime())) return false;
   const today = new Date();
   const age = today.getFullYear() - dob.getFullYear();
   const birthdayThisYear = new Date(
      today.getFullYear(),
      dob.getMonth(),
      dob.getDate()
   );
   const actualAge = today < birthdayThisYear ? age - 1 : age;
   return actualAge >= min && actualAge <= max;
};

export const ValidateDOB = pipe(
   validateDateField('Date of birth'),
   custom(
      (dob): dob is Date => isAgeWithinRange(dob),
      `Age must be between ${LEGAL_AGE_MIN} and ${LEGAL_AGE_MAX} (Valibot)`
   )
);
