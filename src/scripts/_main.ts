import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, closeDB, mongooseConnection } from '@/dbConnect';
import {
   getExpectedCollectionNames,
   syncCollections,
} from '@scripts/_createDedicatedCollection';
import { generateUnboundedArrayMap } from '@scripts/_generate-schema-index';
import type { Db } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_PATH = path.join(__dirname, 'unbounded-array-map.json');

(async function main() {
   try {
      await connectDB();
      const db = mongooseConnection.db as unknown as Db;
      if (!db) throw new Error('Database not initialized.');
      await generateUnboundedArrayMap(JSON_PATH);
      const expectedCollections = await getExpectedCollectionNames(JSON_PATH);
      await syncCollections(db, expectedCollections);
      await closeDB();
   } catch (err) {
      console.error('❌ Script failed:', err);
      process.exit(1);
   }
})();
