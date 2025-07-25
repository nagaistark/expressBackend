import { readdir, writeFile } from 'fs/promises';
import { PathLike } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

import type { BaseSchema, BaseSchemaAsync } from 'valibot';
import { verifyArrayKeySync } from '@utils/validateArrayKeys';
import { isValibotObjectSchema } from '@utils/extractArrayFields';

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_DIR = path.resolve(__dirname, '..', 'schemas');

export async function generateUnboundedArrayMap(
   jsonPath: PathLike
): Promise<void> {
   // Collect success/failure results
   const auditSummary: string[] = [];

   // Track which schemas have unbounded arrays and which fields they affect
   const unboundedArrayPerSchema: Record<string, string[]> = {};

   try {
      const files = await readdir(SCHEMA_DIR);

      for (const file of files) {
         // Ignore non-TypeScript files
         if (!file.endsWith('.ts')) continue;

         const fullPath = path.join(SCHEMA_DIR, file);
         const moduleUrl = pathToFileURL(fullPath).href;

         try {
            const imported = await import(moduleUrl);
            const entries = Object.entries(imported);

            // Count how many VSchema and HCArrayKeys exports we have
            const schemaExports = entries.filter(([name]) =>
               name.endsWith('VSchema')
            );
            const keysExports = entries.filter(([name]) =>
               name.endsWith('HCArrayKeys')
            );
            if (schemaExports.length > 1)
               throw new Error(
                  `❌ ${file} has multiple VSchema exports (${schemaExports.map(([name]) => name).join(', ')})`
               );
            if (keysExports.length > 1)
               throw new Error(
                  `❌ ${file} has multiple HCArrayKeys exports (${keysExports.map(([name]) => name).join(', ')})`
               );

            // Extract runtime schema and optional keys
            const schemaEntry = entries.find(([name]) =>
               name.endsWith('VSchema')
            );
            const keysEntry = entries.find(([name]) =>
               name.endsWith('HCArrayKeys')
            );

            if (!schemaEntry) {
               console.warn(`⚠️ No VSchema found in ${file}`);
               continue;
            }

            const [schemaName, schema] = schemaEntry;

            if (!isValibotObjectSchema(schema)) {
               console.warn(
                  `⚠️ ${schemaName} is not an object schema, skipping`
               );
               continue;
            }
            const keys = keysEntry?.[1] as readonly string[] | undefined;

            try {
               const unboundedFields = verifyArrayKeySync(
                  schema as
                     | BaseSchema<any, any, any>
                     | BaseSchemaAsync<any, any, any>,
                  keys
               ); // Will throw if mismatched
               if (unboundedFields.length > 0) {
                  unboundedArrayPerSchema[schemaName] = unboundedFields;
               }
               auditSummary.push(`✅ ${schemaName}`);
            } catch (validationErr) {
               console.error(
                  `❌ ${schemaName} failed validation:\n`,
                  validationErr
               );
               auditSummary.push(`❌ ${schemaName}`);
            }
         } catch (importErr) {
            console.error(`❌ Failed to import ${file}:`, importErr);
            auditSummary.push(`❌ Import failed: ${file}`);
         }
      }

      console.log('\n=== Audit Summary ===');
      for (const line of auditSummary) {
         console.log(line);
      }

      // Exit if any failures
      if (auditSummary.some(line => line.startsWith('❌'))) {
         process.exit(1);
      }

      const outputPath = jsonPath;
      await writeFile(
         outputPath,
         JSON.stringify(unboundedArrayPerSchema, null, 3),
         'utf-8'
      );
      console.log(`\n📂 Wrote unbounded array map to ${outputPath}`);
   } catch (err) {
      console.error('❌ Failed to read schema directory:', err);
      process.exit(1); // Also critical if directory read fails
   }
}
