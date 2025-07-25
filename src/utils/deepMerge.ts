type PlainObject = Record<string, unknown>;
const forbiddenKeys = [
   '_id',
   '__v',
   '__proto__',
   'constructor',
   'prototype',
] as const;
type ForbiddenKey = (typeof forbiddenKeys)[number];

function isPlainObject(val: unknown): val is PlainObject {
   return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/* function deepMerge<T extends PlainObject>(target: T, source: Partial<T>): T {
   for (const key of Object.keys(source) as (keyof T)[]) {
      // 🔐 Skip forbidden keys like _id and __v
      if (
         forbiddenKeys.includes(key as ForbiddenKey) ||
         !Object.prototype.hasOwnProperty.call(source, key)
      ) {
         continue;
      }

      const sourceVal = source[key];
      const targetVal = target[key];

      // 📦 If the value is an array, we replace it entirely
      if (Array.isArray(sourceVal)) {
         target[key] = sourceVal as T[keyof T];
         continue;
      }

      // 🔁 If both values are plain objects, recurse (deep merge)
      if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
         target[key] = deepMerge(
            { ...(targetVal as PlainObject) },
            sourceVal as PlainObject
         ) as T[typeof key];
         continue;
      }

      // ✅ Assign scalar or null values if defined
      if (sourceVal !== undefined) {
         target[key] = sourceVal as T[keyof T];
      }
   }

   return target;
} */

const allowedKeys = {
   root: ['intake', 'clinical', 'verified'],
   intake: [
      'firstName',
      'lastName',
      'gender',
      'dateOfBirth',
      'phone',
      'address',
      'doctor',
   ],
   'intake.address': ['street', 'city', 'province'],
   clinical: [
      'bloodType',
      'allergies',
      'immunizations',
      'medicalHistory',
      'emergencyContacts',
   ],
};

// export function safeDeepMerge<T extends PlainObject>(
//    target: T,
//    source: unknown
// ): T {
//    if (!isPlainObject(source)) {
//       throw new Error('Can only merge plain objects');
//    }
//    return deepMerge(target, source as Partial<T>);
// }
