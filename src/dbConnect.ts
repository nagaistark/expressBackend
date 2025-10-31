import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger.ts';

// Load the appropriate .env file
dotenv.config({
   path:
      process.env.NODE_ENV?.toLowerCase() === 'production'
         ? '.env.production'
         : '.env',
});

const URI =
   process.env.NODE_ENV?.toLowerCase() === 'production'
      ? process.env.DATABASE_URL
      : process.env.DB_URI;

if (!URI) {
   const errMsg =
      'MongoDB connection URI is not defined in environment variables';
   logger.error(errMsg);
   throw new Error(errMsg);
}

let isIntentionalDisconnection: boolean = false;
let reconnectTries = 0;
const reconnectMaxTries = 10;

// The readyState Codes
const getMongoState = (): string => {
   switch (mongoose.connection.readyState) {
      case 0:
         return 'disconnected from';
      case 1:
         return 'connected to';
      case 2:
         return 'connecting to';
      case 3:
         return 'disconnecting from';
      default:
         return 'unknown';
   }
};

const connectDB = async (): Promise<void> => {
   if (mongoose.connection.readyState !== 0) {
      logger.info(`Already ${getMongoState()} MongoDB`);
      return;
   }

   try {
      await mongoose.connect(URI, {
         maxPoolSize: 10,
         serverSelectionTimeoutMS: 5000,
         autoIndex: process.env.NODE_ENV !== 'production',
      });
      const start = Date.now();
      await mongoose.connection.db?.command({ ping: 1 });
      logger.info(`MongoWarmUp took ${Date.now() - start}ms`);
      logger.info('MongoDB connected successfully!');
   } catch (err) {
      const sanitizedMsg =
         err instanceof Error
            ? err.message.replace(
                 /mongodb(\+srv)?:\/\/[^@]*@/,
                 'mongodb://***@'
              )
            : String(err);
      logger.error(`MongoDB initial connection error: ${sanitizedMsg}`);
      throw err;
   }
};

const handleDisconnection = async (): Promise<void> => {
   if (isIntentionalDisconnection) {
      logger.info('Intentional disconnection, skipping reconnect');
      return;
   }

   // Check if already connected or connecting
   if (
      mongoose.connection.readyState === 1 ||
      mongoose.connection.readyState === 2
   ) {
      logger.info('Connection already established or in progress');
      return;
   }

   if (reconnectTries >= reconnectMaxTries) {
      logger.error('Max reconnection attempts reached. Exiting process.');
      process.exit(1);
   }

   const delay = Math.min(Math.pow(2, reconnectTries) * 1000, 30000);
   logger.info(
      `Scheduling reconnection attempt #${reconnectTries + 1} in ${delay}ms`
   );

   setTimeout(async () => {
      // Recheck connection state before attempting
      if (mongoose.connection.readyState === 1) {
         logger.info('Connection recovered before scheduled reconnect');
         reconnectTries = 0;
         return;
      }

      try {
         logger.info(`Executing reconnection attempt #${reconnectTries + 1}`);
         await mongoose.connect(URI, { maxPoolSize: 10 });
         logger.info('MongoDB reconnected successfully!');
         reconnectTries = 0;
      } catch (err) {
         reconnectTries++;
         logger.error(`Reconnect attempt ${reconnectTries} failed: ${err}`);

         // Schedule the next attempt asynchronously
         // This allows the current timeout to complete and clean up
         setImmediate(() => handleDisconnection());
      }
   }, delay);
};

const closeDB = async (): Promise<void> => {
   try {
      isIntentionalDisconnection = true;
      logger.info('[PENDING] Calling mongoose.disconnect()');
      await mongoose.disconnect();
      logger.info('[CLOSED] MongoDB connection closed');
   } catch (err) {
      logger.error(`Error closing MongoDB connection: ${err}`);
      throw err;
   }
};

const gracefulShutdown = async (
   signal: NodeJS.Signals,
   server?: import('http').Server
): Promise<void> => {
   logger.info(`${signal} received. Shutting down gracefully...`);

   try {
      if (server) {
         const shutdownTimeout = setTimeout(() => {
            logger.warn('Graceful shutdown timeout – forcing close');
            process.exit(1);
         }, 30000);

         await new Promise<void>((resolve, reject) => {
            server.close(err => {
               clearTimeout(shutdownTimeout); // ✅ Clear timeout on success
               err ? reject(err) : resolve();
            });
         });
         logger.info('Server closed');
      }
      await closeDB();
      logger.info('Graceful shutdown complete');
      process.exit(0);
   } catch (err) {
      logger.error(`Error during shutdown: ${err}`);
      process.exit(1);
   }
};

// Get reference to the mongoose connection
const mongooseConnection = mongoose.connection;

// CRITICAL: Remove any existing listeners before registering new ones
// This prevents listener accumulation during hot reloads in development
// When tsx watch reloads this module, the old listeners remain on the
// singleton mongoose.connection object, so we must clean them up first
const removeEventListeners = (): void => {
   mongooseConnection.removeAllListeners('connecting');
   mongooseConnection.removeAllListeners('error');
   mongooseConnection.removeAllListeners('connected');
   mongooseConnection.removeAllListeners('disconnected');
   mongooseConnection.removeAllListeners('reconnected');
   mongooseConnection.removeAllListeners('open');
   mongooseConnection.removeAllListeners('close');
};

removeEventListeners();

// Now register fresh event listeners
// These will be the only listeners after the cleanup above
mongooseConnection.on('connecting', () =>
   logger.info('Attempting MongoDB connection...')
);
mongooseConnection.on('error', err =>
   logger.error(`MongoDB connection error: ${err}`)
);
mongooseConnection.on('connected', () => logger.info('Connected to MongoDB!'));
mongooseConnection.on('disconnected', handleDisconnection);
mongooseConnection.on('reconnected', () => logger.info('MongoDB reconnected!'));
mongooseConnection.on('close', () =>
   logger.info('MongoDB connection closed manually.')
);

export { connectDB, gracefulShutdown, closeDB, mongooseConnection };
