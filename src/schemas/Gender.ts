import { pipe, string, custom, picklist } from 'valibot';
import { GENDERS } from '@lib/constants';

export const GenderVSchema = pipe(
   string(),
   custom(
      (val): val is string => typeof val === 'string' && val.trim() !== '',
      'Gender is required (Valibot)'
   ),
   picklist(Object.values(GENDERS), 'Invalid gender selection (Valibot)')
);
