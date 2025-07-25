import { Types } from 'mongoose';

export type LeanWithObjectId<T> = T & { _id: Types.ObjectId };
export const castToLean = <T>(doc: unknown) => doc as LeanWithObjectId<T>;
export const castArrayToLean = <T>(docs: unknown[]): LeanWithObjectId<T>[] =>
   docs.map(castToLean<T>);
