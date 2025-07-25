import { CANADIAN_POSTAL_CODE_REGEX } from '@lib/constants';

export const isValidCanadianPostalCode = (code: unknown): boolean =>
   typeof code === 'string' && CANADIAN_POSTAL_CODE_REGEX.test(code);
