import { mongooseConnection, connectDB, closeDB } from '@/dbConnect';

const wipeCollections = async (): Promise<void> => {
   const db = mongooseConnection.db;
   if (!db) throw new Error('MongoDB connection is not initialized');

   const collections = await db.listCollections().toArray();

   for (const { name } of collections) {
      if (name !== '__keep__') {
         await db.dropCollection(name);
         console.log(`Dropped collection: ${name}`);
      }
   }

   await db
      .collection('__keep__')
      .updateOne({}, { $set: { _noop: true } }, { upsert: true });

   console.log('✅ __keep__ placeholder ensured');
};

(async () => {
   try {
      await connectDB();
      await wipeCollections();
      await closeDB();
      console.log('🧼 Wipe complete. MongoDB cleaned.');
   } catch (err) {
      console.error('❌ Failed to wipe collections:', err);
      process.exit(1);
   }
})();
