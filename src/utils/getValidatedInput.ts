import { Response } from 'express';
export function getValidatedInput<T>(res: Response): T {
   const data = res.locals.validatedInput;
   if (!data) {
      throw new Error(
         'Missing validated input. Did you forget to run validation?'
      );
   }
   return data as T;
}
