import {
   type InferOutput,
   type BaseSchema,
   type BaseSchemaAsync,
} from 'valibot';
import { EMBEDDED_ARRAY_FIELDS } from '@lib/constants';
import { extractArrayFields } from '@utils/extractArrayFields';

// Generic utility to find all keys pointing to array types
type ArrayKeys<T> = Extract<
   {
      [K in keyof T]: T[K] extends readonly any[] ? K : never;
   }[keyof T],
   string
>;

/**
 * A generic type that derives type-safe array keys from a Valibot schema,
 * while validating and excluding a given set of exception keys.
 */
export type TypeSafeArrayKeys<TOutput> = Exclude<
   ArrayKeys<TOutput>,
   (typeof EMBEDDED_ARRAY_FIELDS)[number]
>;

/**
 * Creates a runtime validation function to ensure a static list of array keys
 * matches the reality of the Valibot schema.
 */
export function verifyArrayKeySync<
   TSchema extends BaseSchema<any, any, any> | BaseSchemaAsync<any, any, any>,
   TExpectedKeys extends readonly TypeSafeArrayKeys<
      InferOutput<TSchema>
   >[] = [],
>(schema: TSchema, staticKeys?: TExpectedKeys): string[] {
   const fallbackKeys = [] as unknown as TExpectedKeys;
   const runtimeKeys = extractArrayFields(schema);
   const hardCodedKeys = staticKeys ?? fallbackKeys;

   const difference = symmetricDifference(
      Array.from(hardCodedKeys),
      Array.from(runtimeKeys)
   );

   if (difference.length > 0) {
      throw new Error(
         `[ArrayKeyMismatch] ❌ Hardcoded keys: [${hardCodedKeys.join(', ')}] — Extracted keys: [${runtimeKeys.join(', ')}] — Difference: [${difference.join(', ')}]`
      );
   }

   if (staticKeys === undefined && runtimeKeys.length > 0) {
      console.warn(
         `[SchemaAudit] ⚠️ Missing HCArrayKeys for schema with array fields: [${runtimeKeys.join(
            ', '
         )}]`
      );
   }

   return runtimeKeys;
}

// === Helper: symmetricDifference ===

function symmetricDifference<T extends string>(a: T[], b: T[]): T[] {
   const aSet = new Set(a);
   const bSet = new Set(b);
   return [...a.filter(k => !bSet.has(k)), ...b.filter(k => !aSet.has(k))];
}
