/* import { Request, Response, NextFunction } from 'express';
import { parseAsync } from 'valibot';

export async function ensureClinicalDefault(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   if (!req.body.clinical) {
      try {
         const clinicalDefault = await parseAsync(
            CreateClinicalFormVSchema,
            {}
         );
         req.body.clinical = clinicalDefault;
      } catch (err) {
         // Shouldn't happen, but catch edge cases (like invalid default values)
         res.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not generate default clinical section',
         });
         return;
      }
   }
   next();
}
 */
