import { NANP_NUMBER_REGEX } from '@lib/constants';

export const isValidNANPPhoneNumber = (phone: unknown): boolean => {
   if (typeof phone !== 'string') return false;
   const digitsOnly = phone.replace(/[^\d]/g, '');
   // Accepting 10-digit numbers or 11-digit numbers that start with '1'
   if (!NANP_NUMBER_REGEX.test(digitsOnly)) return false;
   return true;
};
