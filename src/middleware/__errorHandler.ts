import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
import logger from '@/logger';
import { ValidationError as CustomValidationError } from '@errors/ValidationError';

const isDev = process.env.NODE_ENV !== 'production';

// Since TypeScript 4.4, the default type for `catch` is `unknown`
export const extractErrorMessage = (err: unknown): string =>
   err instanceof Error ? err.message : 'An unknown error occurred';

type CustomErrorHandler = (
   // err: Error & { status?: number },
   err: unknown,
   req: Request,
   res: Response,
   next: NextFunction
) => void;

interface MongoDuplicateKeyError extends Error {
   code: number;
   keyValue: Record<string, unknown>;
}

const isMongoDuplicateKeyError = (
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

const hasStatus = (err: unknown): err is { status: number } => {
   return (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      typeof (err as Record<string, unknown>).status === 'number'
   );
};

export const errorHandler: CustomErrorHandler = (err, req, res, next) => {
   logger.error(
      {
         err,
         path: req.path,
         method: req.method,
         userAgent: req.get('User-Agent'), // Optional: Add more context for better debugging
      },
      'Error occurred in request'
   );

   if (res.headersSent) {
      return next(err);
   }

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

   if (isMongoDuplicateKeyError(err)) {
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
   // Use type guard to safely extract status (prevents TypeError if err is primitive like string/number; TypeScript now infers status as number)
   const status = hasStatus(err) ? err.status : 500;

   // In dev, include stack trace for debugging but only if it's an Error instance (avoids leaking non-error details); always use generic message to minimize info exposure
   const responseBody = {
      error: isDev ? extractErrorMessage(err) : 'Internal server error',
      ...(isDev && err instanceof Error && { stack: err.stack }), // Optional dev-only stack for local troubleshooting
   };

   res.status(status).json(responseBody);
};
