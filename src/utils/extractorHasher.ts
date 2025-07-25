import type { BaseSchema, BaseSchemaAsync } from 'valibot';
import { createHash } from 'crypto';

type FieldMetadata = {
   type: string;
   nested?: Record<string, FieldMetadata>;
};

type SchemaMetadata = Record<string, FieldMetadata>;

function unwrapSchema(
   schema: BaseSchema<unknown, any, any> | BaseSchemaAsync<unknown, any, any>
): BaseSchema<unknown, any, any> | BaseSchemaAsync<unknown, any, any> {
   if (typeof schema !== 'object' || schema === null) {
      throw new Error('unwrappedSchema: Input must be a Valibot schema object');
   }

   let current = schema;
   const seen = new Set();

   while (typeof current === 'object' && current !== null) {
      if (seen.has(current)) break;
      seen.add(current);

      // Unwrap .optional(), .nullable(), .fallback(), etc.
      if ('wrapped' in current && current.wrapped) {
         if (
            typeof current.wrapped === 'object' &&
            current.wrapped !== null &&
            ('type' in current.wrapped || 'pipe' in current.wrapped)
         ) {
            current = current.wrapped as
               | BaseSchema<unknown, any, any>
               | BaseSchemaAsync<unknown, any, any>;
            continue;
         }
      }

      // Unwrap .pipe([...]) — use last item as the terminal transformation
      if (
         'pipe' in current &&
         Array.isArray(current.pipe) &&
         current.pipe.length > 0
      ) {
         const last = current.pipe[current.pipe.length - 1];
         if (last && typeof last === 'object') {
            current = last as
               | BaseSchema<unknown, any, any>
               | BaseSchemaAsync<unknown, any, any>;
            continue;
         }
      }
      break;
   }

   if (
      typeof current !== 'object' ||
      current === null ||
      !('type' in current) ||
      typeof current.type !== 'string'
   ) {
      throw new Error(
         'unwrapSchema: Could not resolve to a core Valibot schema'
      );
   }

   return current as
      | BaseSchema<unknown, any, any>
      | BaseSchemaAsync<unknown, any, any>;
}

export function extractSchemaMetadata(
   schema: BaseSchema<any, any, any>
): SchemaMetadata {
   const walk = (s: BaseSchema<any, any, any>): FieldMetadata => {
      const unwrapped = unwrapSchema(s);

      if (unwrapped.type === 'object') {
         const objShape = (unwrapped as any).entries;
         const nested: Record<string, FieldMetadata> = {};
         for (const key in objShape) {
            nested[key] = walk(objShape[key]);
         }
         return { type: 'object', nested };
      }

      if (unwrapped.type === 'array') {
         const inner = (unwrapped as any).item;
         return {
            type: 'array',
            nested:
               walk(inner).type === 'object' ? walk(inner).nested : undefined,
         };
      }

      return { type: unwrapped.type };
   };

   return walk(schema).nested ?? {};
}

export function hashSchema(metadata: SchemaMetadata): string {
   const json = JSON.stringify(metadata, Object.keys(metadata).sort()); // stable
   return createHash('sha256').update(json).digest('hex');
}
