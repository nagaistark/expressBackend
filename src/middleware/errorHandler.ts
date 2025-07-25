import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';

import { ValidationError as CustomValidationError } from '@errors/ValidationError';

// Since TypeScript 4.4, the default type for `catch` is `unknown`
export const extractErrorMessage = (err: unknown): string =>
   err instanceof Error ? err.message : 'An unknown error occurred';

type CustomErrorHandler = (
   // err: Error & { status?: number },
   err: any,
   req: Request,
   res: Response,
   next: NextFunction
) => void;

interface MongoDuplicateKeyError extends Error {
   code: number;
   keyValue: Record<string, unknown>;
}

const isMongoDublicateKeyError = (
   err: unknown
): err is MongoDuplicateKeyError => {
   return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as Record<string, unknown>).code === 11000 &&
      'keyValue' in err
   );
};

export const errorHandler: CustomErrorHandler = (err, req, res, next) => {
   // Handle Mongoose Versioning Conflict
   if (err instanceof Error.VersionError) {
      return res.status(409).json({
         error: 'Conflict',
         message:
            'This record has been updated elsewhere. Please refresh and try again',
      });
   }

   if (err instanceof Error.ValidationError) {
      const messages = Object.values(err.errors).map(e => e.message);
      return res
         .status(400)
         .json({ error: 'Validation failed', details: messages });
   }

   if (err instanceof Error.CastError) {
      return res.status(400).json({ error: 'Invalid ID format' });
   }

   if (isMongoDublicateKeyError(err)) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
         error: 'Duplicate key',
         message: `Duplicate value for field "${field}"`,
      });
   }

   if (err instanceof CustomValidationError) {
      return res.status(400).json({
         error: 'Validation failed',
         details: err.issues,
      });
   }

   // Catch-all fallback
   res.status(err.status || 500).json({ error: extractErrorMessage(err) });
};
