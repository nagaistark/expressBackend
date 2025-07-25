import { Request, Response, NextFunction } from 'express';

export function ensurePreferredDoctorDefault(
   req: Request,
   res: Response,
   next: NextFunction
) {
   if (
      req.body.doctor === undefined ||
      req.body.doctor === null ||
      (typeof req.body.doctor === 'string' && req.body.doctor.trim() === '')
   ) {
      req.body.doctor = 'unspecified';
   }
   next();
}
