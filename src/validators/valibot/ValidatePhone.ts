import {
   pipeAsync,
   string,
   transform,
   minLength,
   custom,
   customAsync,
} from 'valibot';
import { normalizePhone } from '@utils/normalizePhone';
import { isValidNANPPhoneNumber } from '@validators/mongoose/isValidNANPPhoneNumber';
import { isPhoneNumberTaken } from '@utils/isPhoneNumberTaken';

export const ValidatePhone = pipeAsync(
   string(),
   transform(normalizePhone),
   minLength(1, 'Phone number is requied (Valibot)'),
   custom(isValidNANPPhoneNumber, 'Invalid Canadian phone number (Valibot)'),
   customAsync(async val => {
      const taken = await isPhoneNumberTaken(val as string);
      return !taken;
   }, 'Phone number is already taken (Valibot)')
);
