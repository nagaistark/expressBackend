import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Model } from 'mongoose';
import { IPatient } from '@mytypes/Patient';

export function deleteById<T>(Entity: Model<T>): RequestHandler {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const { id } = req.params;
         const doc = await Entity.findById(id);

         if (!doc) {
            res.status(404).json({ message: 'Document not found' });
            return;
         }

         await doc.deleteOne();
         res.status(200).json({ message: 'Document deleted successfully' });
      } catch (err) {
         next(err);
      }
   };
}

export function deleteAll<T>(Entity: Model<T>): RequestHandler {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const docs = await Entity.find();
         if (docs.length === 0) {
            res.status(404).json({ message: 'No documents found to delete' });
            return;
         }

         for (const doc of docs) {
            await doc.deleteOne();
         }

         res.status(200).json({
            message: `Deleted ${docs.length} document(s)`,
         });
      } catch (err) {
         next(err);
      }
   };
}
