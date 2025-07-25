import { readFile } from 'fs/promises';
import { PathLike } from 'fs';
import { Db } from 'mongodb';

/*
 * Reads the unbounded-array-map.json and returns a Set of exptected collection names
 * Each entry becomes `%{prefix}__${fieldName}`
 *
 * @param prefix - The model prefix (e.g., "patients", "doctors", etc.)
 * @param jsonPath - Path to the `unbounded-array-map.json` file
 * @returns A Set of expected collection names like "patients__allergies"
 */
export async function getExpectedCollectionNames(
   jsonPath: PathLike
): Promise<string[]> {
   try {
      // Read and parse the JSON file (ex: unbounded-array-map.json)
      const raw = await readFile(jsonPath, 'utf-8');

      // Resulting type: Record<SchemaExportName, string[]>
      // Example:
      // {
      //   "CreatePatientVSchema": ["allergies", "medicalHistory"],
      //   "CreateDoctorVSchema": ["patients"]
      // }
      const mapping: Record<string, string[]> = JSON.parse(raw);

      const names: string[] = [];

      // Loop through every schema in the file
      for (const [schemaExportName, fieldNames] of Object.entries(mapping)) {
         /**
          * Extract the "model prefix" from the schema name.
          * Assumes schema names are like "CreatePatientVSchema" → "patients"
          *   1. Remove "Create" (if present)
          *   2. Remove "VSchema" suffix
          *   3. Convert PascalCase to camel → lowercase plural (quick guesswork)
          */
         const modelName = schemaExportName
            .replace(/^Create/, '')
            .replace(/VSchema$/, '');

         // If no modelName, skip silently (badly named export?)
         if (!modelName) continue;

         // Turn e.g. "Patient" into "patients", "Admin" into "admins", etc.
         const modelPrefix =
            modelName.charAt(0).toLowerCase() + modelName.slice(1) + 's';

         // Now generate the expected collection names for each unbounded field
         for (const field of fieldNames) {
            names.push(`${modelPrefix}__${field}`);
         }
      }
      return names;
   } catch (err) {
      console.error('❌ Failed to extract expected collection names:', err);
      return []; // fail-safe fallback
   }
}

export async function syncCollections(
   database: Db,
   expected: string[]
): Promise<void> {
   try {
      // Step 1: Get actual collections in the database
      const actualCollections = await database
         .listCollections({}, { nameOnly: true })
         .toArray();

      const actualNames = new Set(
         (actualCollections as { name: string }[]).map(({ name }) => name)
      );

      // Step 2: Determine missing collections (expected but not found)
      const missing = expected.filter(name => !actualNames.has(name));

      // Step 3: Determine orphaned collections (found but not expected)
      const expectedSet = new Set(expected);
      const orphaned = Array.from(actualNames).filter(name => {
         // Must contain a double underscore and not be in the expected list
         return name.includes('__') && !expectedSet.has(name);
      });

      // Log orphaned collections (not deleted — just a warning)
      if (orphaned.length > 0) {
         console.warn(`⚠️ Found ${orphaned.length} orphaned collection(s):`);
         for (const name of orphaned) {
            console.warn(`⛔ Orphaned: ${name}`);
         }
      }

      // Step 4: Create missing collections
      if (missing.length === 0) {
         console.log('✅ All expected collections are present.');
      } else {
         console.log(`🛠️ Creating ${missing.length} missing collections...`);
         for (const name of missing) {
            try {
               await database.createCollection(name);
               console.log(`📁 Created collection: ${name}`);
            } catch (err) {
               console.error(`❌ Failed to create collection '${name}':`, err);
            }
         }
      }
   } catch (err) {
      console.error('❌ Failed during collection sync:', err);
      throw err; // Optional: re-throw to be handled by caller
   }
}
