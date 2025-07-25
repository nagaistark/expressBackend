import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Model } from 'mongoose';
import { getValidatedInput } from '@utils/getValidatedInput';

export function createOne<T>(Entity: Model<T>): RequestHandler {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const data = getValidatedInput<T>(res);
         const newDoc = new Entity(data);
         const saved = await newDoc.save();
         res.status(201).json(saved);
      } catch (err) {
         next(err);
      }
   };
}

export function createMany<T>(Entity: Model<T>): RequestHandler {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const data = req.body;
         if (!Array.isArray(data) || data.length === 0) {
            res.status(400).json({
               message: 'Request body must be a non-empty array',
            });
            return;
         }
         const docs = data.map(item => new Entity(item));
         await Promise.all(docs.map(doc => doc.save()));
         res.status(201).json({
            message: `${docs.length} document(s) created`,
         });
      } catch (err) {
         next(err);
      }
   };
}
