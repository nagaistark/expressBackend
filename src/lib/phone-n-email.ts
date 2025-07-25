import { pipe, string, custom } from 'valibot';
import { VALID_EMAIL_REGEX } from '@lib/constants';

export const isValidEmail = (email: unknown): boolean =>
   typeof email === 'string' && VALID_EMAIL_REGEX.test(email);

export const ValidateEmail = pipe(
   string(),
   custom(isValidEmail, 'Invalid email format (Valibot)')
);
