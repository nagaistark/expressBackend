import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Model, Types, UpdateQuery, FilterQuery } from 'mongoose';
import { object, optional, string, email, minLength, pipe } from 'valibot';

/* export function updateById<T>(Entity: Model<T>): RequestHandler {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const { id } = req.params;
         if (!Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid ID format' });
            return;
         }

         const doc = await Entity.findById(id);
         if (!doc) {
            res.status(404).json({ message: 'Document not found' });
            return;
         }

         doc.set(req.body);
         const updated = await doc.save();

         res.status(200).json(updated);
      } catch (err) {
         next(err);
      }
   };
} */

function deepMerge(target: any, source: any): any {
   // If source is not an object, return it directly
   if (typeof source !== 'object' || source === null) {
      return source;
   }

   // If target is not an object, make it one
   if (typeof target !== 'object' || target === null) {
      target = {};
   }

   for (const key of Object.keys(source)) {
      const srcVal = source[key];
      const tgtVal = target[key];

      // Recursively merge if both are plain objects
      if (
         typeof srcVal === 'object' &&
         srcVal !== null &&
         !Array.isArray(srcVal) &&
         typeof tgtVal === 'object' &&
         tgtVal !== null &&
         !Array.isArray(tgtVal)
      ) {
         target[key] = deepMerge(tgtVal, srcVal);
      } else {
         target[key] = srcVal;
      }
   }

   return target;
}

export function updateById<T>(Entity: Model<T>): RequestHandler {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const { id } = req.params;
         if (!Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid ID format' });
            return;
         }

         const doc = await Entity.findById(id);
         if (!doc) {
            res.status(404).json({ message: 'Document not found' });
            return;
         }

         // Convert doc to POJO to safely manipulate
         const current = doc.toObject();

         // Recursively merge `req.body` into `current`
         const merged = deepMerge(current, req.body);

         // Set merged object onto the document
         doc.set(merged);
         const updated = await doc.save();

         res.status(200).json(updated);
      } catch (err) {
         next(err);
      }
   };
}

/**
 * Usage of this one would require sending a filter and update object in the body, e.g.:
 * {
 *    "filter": { "role": "patient" },
 *    "update": { "status": "archived" }
 * }
 */

interface UpdateManyRequestBody<T> {
   filter: FilterQuery<T>;
   update: UpdateQuery<T>;
}

export function updateMany<T>(Entity: Model<T>) {
   return async (
      req: Request<unknown, unknown, UpdateManyRequestBody<T>>,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const { filter, update } = req.body;
         const result = await Entity.updateMany(filter, update, {
            runValidators: true,
         });

         res.status(200).json({
            message: `${result.modifiedCount} document(s) updated`,
         });
      } catch (err) {
         next(err);
      }
   };
}
