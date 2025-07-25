import { custom, pipe } from 'valibot';
import type { BaseSchema } from 'valibot';

// Generic wrapper to make any synchronous schema required
export const requiredField = <T>(
   schema: BaseSchema<T, any, any>,
   message = 'This field is required'
): BaseSchema<T, any, any> =>
   pipe(
      custom<T>(
         val => val !== undefined && val !== null && val !== '',
         message
      ),
      schema
   );

import { customAsync, pipeAsync } from 'valibot';
import type { BaseSchemaAsync } from 'valibot';

// Generic wrapper to make any anynchronous schema required
export const requiredFieldAsync = <T>(
   schema: BaseSchemaAsync<T, any, any>,
   message = 'This field is required'
): BaseSchemaAsync<T, any, any> =>
   pipeAsync(
      customAsync<T>(
         val => val !== undefined && val !== null && val !== '',
         message
      ),
      schema
   );
