import { type BaseSchema, BaseSchemaAsync } from 'valibot';

export function isValibotObjectSchema(
   input: unknown
): input is BaseSchema<any, any, any> | BaseSchemaAsync<any, any, any> {
   return (
      typeof input === 'object' &&
      input !== null &&
      'type' in input &&
      typeof (input as any).type === 'string' &&
      [
         'object',
         'object_async',
         'strict_object',
         'strict_object_async',
      ].includes((input as any).type)
   );
}
