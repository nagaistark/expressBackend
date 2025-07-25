import type { ObjectSchema, ObjectSchemaAsync } from 'valibot';
import { EMBEDDED_ARRAY_FIELDS } from '@lib/constants';

const OBJECT_TYPES = new Set([
   'object',
   'object_async',
   'strict_object',
   'strict_object_async',
]);

export function isValibotObjectSchema(
   schema: unknown
): schema is ObjectSchema<any, any> | ObjectSchemaAsync<any, any> {
   if (typeof schema !== 'object' || schema === null) {
      return false;
   }
   const s = schema as any;
   return (
      OBJECT_TYPES.has(s.type) &&
      typeof s.entries === 'object' &&
      s.entries !== null
   );
}

/**
 * Extracts the keys of all fields containing an array from a Valibot object schema.
 */
export function extractArrayFields(
   schema: unknown,
   exceptions: readonly string[] = EMBEDDED_ARRAY_FIELDS
): string[] {
   // Validate the input schema directly.
   if (!isValibotObjectSchema(schema)) {
      throw new Error(
         'Invalid argument: Input is not a Valibot object schema.'
      );
   }

   const arrayFieldKeys: string[] = [];

   // The recursive helper remains the same as it was already correct.
   const isOrContainsArray = (schema: any, visited = new Set()): boolean => {
      if (!schema || typeof schema !== 'object') return false;
      if (visited.has(schema)) return false;
      visited.add(schema);

      const type = schema.type;

      // Direct array detection
      if (type === 'array' || type === 'array_async') return true;

      // Check wrapped (chained transforms, effects, etc.)
      if ('wrapped' in schema)
         return isOrContainsArray(schema.wrapped, visited);

      // Check entries (for object, strict_object, etc.)
      if (schema.entries && typeof schema.entries === 'object') {
         return Object.values(schema.entries).some(s =>
            isOrContainsArray(s, visited)
         );
      }

      // Check items (for tuples or arrays of schemas)
      if (Array.isArray(schema.items)) {
         return (schema.items as any[]).some((s: unknown) =>
            isOrContainsArray(s, visited)
         );
      }

      // Check variants (e.g. union, variant, discriminated union)
      if (Array.isArray(schema.variants)) {
         return (schema.variants as any[]).some(s =>
            isOrContainsArray(s, visited)
         );
      }

      // Check pipe (common wrapper for transforms/validations)
      if (Array.isArray(schema.pipe)) {
         return (schema.pipe as any[]).some(s => isOrContainsArray(s, visited));
      }

      // Check inner schema (used in some constraints like nonempty, readonly, etc.)
      if ('schema' in schema) {
         return isOrContainsArray(schema.schema, visited);
      }

      return false;
   };

   // Iterate over the schema's entries.
   for (const [key, fieldSchema] of Object.entries(schema.entries)) {
      if (isOrContainsArray(fieldSchema)) {
         arrayFieldKeys.push(key);
      }
   }

   return arrayFieldKeys.filter(key => !exceptions.includes(key));
}
