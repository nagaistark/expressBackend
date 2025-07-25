import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Model, Types } from 'mongoose';
import { castToLean } from '@/utils/castToLean';
import { mongooseConnection } from '@/dbConnect';

export function getById<T>(Entity: Model<T>): RequestHandler {
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
         const doc = await Entity.findById(id).lean();
         if (!doc) {
            res.status(404).json({ message: 'Document not found' });
            return;
         }
         res.status(200).json(castToLean<T>(doc));
      } catch (err) {
         next(err);
      }
   };
}

type MongoDoc = Record<string, unknown>;

export function getAll<T extends MongoDoc>(
   collectionName: string,
   projection?: Record<string, 0 | 1>
): RequestHandler {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const collection = mongooseConnection.collection<T>(collectionName);
         const cursor = projection
            ? collection.find({}).project(projection)
            : collection.find({});
         const docs = await cursor.toArray();
         res.status(200).json(docs);
      } catch (err) {
         next(err);
      }
   };
}
