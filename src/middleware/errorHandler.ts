import type { Request, Response, NextFunction } from 'express';
import logger from '../logger.ts';

// Whitelist of valid HTTP status codes
const VALID_STATUS_CODES = new Set([
   400, 401, 403, 404, 405, 406, 408, 409, 410, 411, 412, 413, 414, 415, 416,
   417, 418, 422, 423, 424, 425, 426, 428, 429, 431, 451, 500, 501, 502, 503,
   504, 505, 506, 507, 508, 510, 511,
]);

// Define a strongly-typed structure for known app errors
export interface AppError extends Error {
   statusCode?: number;
   expose?: boolean;
}

// Utility function to safely extract message
export const extractErrorMessage = (err: unknown): string => {
   if (err instanceof Error) return err.message;
   if (typeof err === 'string') return err;
   return 'An unknown error occurred';
};

// Type guard to safely check if err is an AppError (extends Error)
// This enables type narrowing without unsafe casting, preventing runtime TypeErrors when accessing properties like `message` or `stack` on non-object err values.
const isAppError = (err: unknown): err is AppError => {
   return typeof err === 'object' && err !== null && err instanceof Error;
};

// Core error-handling middleware
export const errorHandler = (
   err: unknown,
   req: Request,
   res: Response,
   next: NextFunction
): void => {
   // Check if response headers have already been sent (e.g., during streaming or partial writes). If true, delegate to Express's default error handler via next (err) to gracefully close the connection and avoid corrupting the response or causing hangs/resource leaks.
   if (res.headersSent) {
      next(err);
      return;
   }

   const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';

   // Avoid direct casting of err to AppError. Instead, use the type guard to narrow err safely. This extracts properties only if err is a valid Error instance, falling back to defaults otherwise. Prevents TypeErrors crashes when err is a primitive (e.g., throw 'string' or throw 404).
   let status = 500;
   let errorName = 'Error';
   let errorMessage = 'An unknown error occurred';
   let stack: string | undefined = undefined;
   let expose = false;

   if (isAppError(err)) {
      // Validate status code against whitelist
      status =
         err.statusCode && VALID_STATUS_CODES.has(err.statusCode)
            ? err.statusCode
            : 500;
      errorName = err.name || 'Error';
      errorMessage = err.message || 'An unknown error occurred';
      stack = err.stack;
      expose = err.expose || false;
   } else {
      // Fallback for non-Error throws (e.g., strings, numbers): Use extractErrorMessage for message
      errorMessage = extractErrorMessage(err);
   }

   // Determine client-facing message: Hide details in prod unless explicitly exposed (e.g., for 4xx client errors). Only expose 4xx errors in prod, never 5xx.
   const shouldExpose = expose && status >= 400 && status < 500;
   const message =
      isProd && !shouldExpose ? 'Internal server error' : errorMessage;

   // Log full details (safe now due to narrowing: stack is undefined if not Error, Pino handles it gracefully). This ensures all errors are observable without crashing the logger.
   logger.error({
      msg: 'Request error',
      name: errorName,
      message: errorMessage,
      stack,
      statusCode: status,
      path: req.originalUrl,
      method: req.method,
      requestId: req.id || req.headers['x-request-id'], // If using pino-http, req.id is auto-generated
   });

   // Send consistent JSON response: Always safe, as vars are guarded.
   try {
      res.status(status).json({
         error: errorName,
         message,
      });
   } catch (sendError) {
      logger.error({
         msg: 'Failed to send error response',
         originalError: errorName,
         sendError:
            sendError instanceof Error
               ? sendError.message
               : 'Unknown send error',
      });
   }
};

// === A HELPER FOR CREATING TYPES CUSTOM ERRORS
export class HttpError extends Error implements AppError {
   statusCode?: number | undefined;
   expose?: boolean | undefined;
   constructor(message: string, statusCode = 500, expose = false) {
      super(message);
      this.statusCode = statusCode;
      this.expose = expose;
      this.name = 'HttpError';
      // Maintains proper prototype chain for instanceof checks
      Object.setPrototypeOf(this, HttpError.prototype);
   }
}
