import { CreatePatientVSchema } from '@schemas/Patient';

type Path = (string | number)[];

function pathToString(path: Path): string {
   return path.join('.');
}

function stringToPath(s: string): Path {
   return s.split('.').map(p => (isNaN(Number(p)) ? p : Number(p)));
}

function getSchemaPaths(
   schema: any,
   seenSchemas: WeakSet<object> = new WeakSet(),
   prefix: Path = [],
   pathSet: Set<string> = new Set()
): Set<Path> {
   // Stop if nullish or already seen
   if (!schema || typeof schema !== 'object' || seenSchemas.has(schema)) {
      if (prefix.length) pathSet.add(pathToString(prefix));
      return new Set(Array.from(pathSet).map(stringToPath));
   }

   seenSchemas.add(schema);

   const { type, pipe, options, entries, item, wrapped } = schema;

   // Unwrap any wrapped schemas
   if (wrapped) {
      return getSchemaPaths(wrapped, seenSchemas, prefix, pathSet);
   }

   // Pipe logic (unwrap until we hit a real structure)
   if (Array.isArray(pipe)) {
      for (const s of pipe) {
         if (
            s &&
            typeof s === 'object' &&
            typeof s.type === 'string' &&
            ['object', 'strict_object', 'array', 'union'].includes(s.type)
         ) {
            return getSchemaPaths(s, seenSchemas, prefix, pathSet);
         }
      }
      // All pipes were primitive transforms — treat as leaf
      if (prefix.length) pathSet.add(pathToString(prefix));
      return new Set(Array.from(pathSet).map(stringToPath));
   }

   // Union: merge all option branches
   if (type === 'union' && Array.isArray(options)) {
      for (const option of options) {
         getSchemaPaths(option, seenSchemas, prefix, pathSet);
      }
      return new Set(Array.from(pathSet).map(stringToPath));
   }

   // Arrays
   if (type === 'array' && item) {
      // Represent array nesting with a 0 to indicate index-like depth
      return getSchemaPaths(item, seenSchemas, prefix, pathSet);
   }

   // Objects (plain or strict)
   if ((type === 'object' || type === 'strict_object') && entries) {
      for (const key in entries) {
         if (Object.prototype.hasOwnProperty.call(entries, key)) {
            getSchemaPaths(
               entries[key],
               seenSchemas,
               [...prefix, key],
               pathSet
            );
         }
      }
      return new Set(Array.from(pathSet).map(stringToPath));
   }

   // Leaf types
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
      if (prefix.length) pathSet.add(pathToString(prefix));
      return new Set(Array.from(pathSet).map(stringToPath));
   }

   // Fallback: unknown types treated as leaf
   if (prefix.length) pathSet.add(pathToString(prefix));
   return new Set(Array.from(pathSet).map(stringToPath));
}

const ALLOWED_PATIENT_UPDATE_KEYS = getSchemaPaths(CreatePatientVSchema);
// console.log(ALLOWED_PATIENT_UPDATE_KEYS);
