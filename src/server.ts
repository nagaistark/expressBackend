import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import logger from './logger.ts';
import { fileURLToPath } from 'url';
import { connectDB, gracefulShutdown, closeDB } from './dbConnect.ts';

// Routes (currently under construction / revision)
import patientRoutes from '@/routes/v1/patientRoutes.ts';
import diagnosisRoutes from '@/routes/v1/diagnosisRoutes.ts';
import doctorRoutes from '@/routes/v1/doctorRoutes.ts';

import { errorHandler } from '@/middleware/__errorHandler.ts';

const app: Express = express();
const port: number = parseInt(process.env.PORT || '8080');
const host: string = process.env.HOST || '127.0.0.1';
const allowedOrigins: string[] = process.env.CORS_ORIGINS
   ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
   : process.env.CORS_ORIGIN
     ? [process.env.CORS_ORIGIN]
     : [];

// Reusable CORS Settings
const corsSettings = {
   origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
   ) => {
      if (!origin) {
         if (process.env.NODE_ENV?.toLowerCase() !== 'production') {
            return callback(null, true);
         }
         return callback(null, false);
      }

      if (allowedOrigins.includes(origin)) {
         callback(null, true);
      } else {
         logger.warn(`CORS: Blocked request from origin: ${origin}`);
         callback(null, false);
      }
   },
   credentials: true, // If you're using cookies/auth headers
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   allowedHeaders: ['Content-Type', 'Authorization'],
};

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// General rate limiter for all requests
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100, // Max 100 requests per IP per window
   message: 'Too many requests from this IP, please try again later',
   standardHeaders: true,
   legacyHeaders: false,
});

// Middleware
app.use((req, res, next) => {
   res.setHeader('X-Content-Type-Options', 'nosniff');
   res.setHeader('X-Frame-Options', 'DENY');
   res.setHeader('X-XSS-Protection', '1; mode=block'); // Legacy but harmless
   res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
   next();
});
app.use(limiter);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cors(corsSettings));
app.use(
   pinoHttp({
      logger,
      customLogLevel: (req, res, err) => {
         if (res.statusCode >= 500 || err) return 'error';
         if (res.statusCode >= 400) return 'warn';
         return 'info';
      },
   })
);
app.set('etag', false); // Disable default ETag header

// Wiring up the routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/diagnoses', diagnosisRoutes);

// Simple root route
app.get(/^\/$|\/index(.html)?$/, (req, res) => {
   res.send('<h1>Welcome to Cambridge Med, Ontario!</h1>');
});

// Error-handling middleware (currently being revised)
app.use(errorHandler);

let server: import('http').Server;

const startServer = async (): Promise<void> => {
   try {
      await connectDB();
      server = app.listen(port, host, () => {
         logger.info(`Server running at http://${host}:${port}`);
      });

      // Register handlers when server exists
      logger.info('Signal handlers attached');
      process.on('SIGINT', () => gracefulShutdown('SIGINT', server));
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
   } catch (err) {
      logger.error(`Failed to start server: ${err}`);
      // Clean up database connection before exiting
      try {
         await closeDB();
      } catch (cleanupErr) {
         logger.error(`Error during startup cleanup: ${cleanupErr}`);
      }
      process.exit(1);
   }
};

startServer();

// Extra guards
process.on('beforeExit', code => {
   logger.info(`beforeExit with code ${code}`);
});
process.on('exit', code => logger.info(`Process exiting with code: ${code}`));

const handleFatal = (type: string) => (err: unknown) => {
   // Use console.error for synchronous, unbuffered output
   // This ensures the error is written immediately to stderr
   console.error(`\n${'='.repeat(80)}`);
   console.error(`FATAL ${type} - Process will terminate`);
   console.error(`${'='.repeat(80)}`);
   console.error(err);
   console.error(`${'='.repeat(80)}\n`);

   // Also try to log via Pino, but don't rely on it
   try {
      logger.error({
         msg: `Fatal ${type}`,
         error: err instanceof Error ? err.message : String(err),
         stack: err instanceof Error ? err.stack : undefined,
      });
      // Force flush if your logger supports it
      // Pino doesn't have a public flush() method, so this is best-effort
   } catch (logError) {
      console.error('Failed to log via Pino:', logError);
   }

   // DO NOT attempt async cleanup here
   // The application state is corrupted and unreliable
   // Let the process supervisor handle restart and reconnection

   // Exit immediately with error code
   process.exit(1);
};

process.on('uncaughtException', handleFatal('Uncaught Exception'));
process.on('unhandledRejection', handleFatal('Unhandled Rejection'));

app.disable('x-powered-by'); // Hide Express fingerprint
