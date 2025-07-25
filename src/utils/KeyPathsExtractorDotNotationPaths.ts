import { CreatePatientVSchema } from '@schemas/Patient';

function getSchemaKeys(
   schema: any,
   keys: Set<string> = new Set(),
   prefix = '',
   seenSchemas: WeakSet<object> = new WeakSet()
): Set<string> {
   // Ensure we are working with a valid object, otherwise stop.
   if (!schema || typeof schema !== 'object' || seenSchemas.has(schema)) {
      if (prefix) keys.add(prefix);
      return keys;
   }

   seenSchemas.add(schema);

   const type = schema.type;
   const isAsync = schema.async === true;

   // Handle unwrapping
   if ('wrapped' in schema) {
      return getSchemaKeys(schema.wrapped, keys, prefix, seenSchemas);
   }

   // Handle pipe: look for the next "inner" schema
   if ('pipe' in schema && Array.isArray(schema.pipe)) {
      for (const s of schema.pipe) {
         if (
            s &&
            typeof s === 'object' &&
            typeof s.type === 'string' &&
            ['object', 'strict_object', 'array', 'union'].includes(s.type)
         ) {
            return getSchemaKeys(s, keys, prefix, seenSchemas);
         }
      }
      // No complex schema found in pipe — treat as leaf
      if (prefix) keys.add(prefix);
      return keys;
   }

   // Handle union
   if (type === 'union' && Array.isArray(schema.options)) {
      for (const option of schema.options) {
         getSchemaKeys(option, keys, prefix, seenSchemas);
      }
      return keys;
   }

   // Handle arrays
   if (type === 'array' && schema.item) {
      return getSchemaKeys(schema.item, keys, prefix, seenSchemas);
   }

   // Handle objects (both strict and non-strict)
   if ((type === 'object' || type === 'strict_object') && schema.entries) {
      for (const key in schema.entries) {
         if (Object.prototype.hasOwnProperty.call(schema.entries, key)) {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            getSchemaKeys(schema.entries[key], keys, newPrefix, seenSchemas);
         }
      }
      return keys;
   }

   // Leaf types (string, boolean, number, etc.)
   const leafTypes = new Set([
      'string',
      'number',
      'boolean',
      'bigint',
      'symbol',
      'date',
      'null',
      'undefined',
      'any',
      'unknown',
      'never',
      'void',
   ]);

   if (leafTypes.has(type)) {
      if (prefix) keys.add(prefix);
      return keys;
   }

   // Catch-all: treat as leaf if not handled above
   if (prefix) keys.add(prefix);
   return keys;
}

const ALLOWED_PATIENT_UPDATE_KEYS = getSchemaKeys(CreatePatientVSchema);
// console.log(ALLOWED_PATIENT_UPDATE_KEYS);
