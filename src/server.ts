import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, gracefulShutdown, closeDB } from './dbConnect.ts';

import patientRoutes from '@routes/patientRoutes';
import diagnosisRoutes from '@routes/diagnosisRoutes';
import doctorRoutes from '@routes/doctorRoutes';

import { errorHandler } from '@middleware/errorHandler.ts';

dotenv.config();

const app: Express = express();
const port: number = parseInt(process.env.PORT || '8080');
const host: string = process.env.HOST || '127.0.0.1';

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '100kb' }));
app.use(cors({ origin: 'http://ontcamclinic.local:5173' }));
app.options('/waitlist', cors());
app.set('etag', false); // Disable default ETag header

// Wiring up the routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/diagnoses', diagnosisRoutes);

// Simple root route
app.get(/^\/$|\/index(.html)?$/, (req, res) => {
   res.send('<h1>Welcome to Cambridge Med, Ontario!</h1>');
});

// Error-handling middleware
app.use(errorHandler);

let server: import('http').Server;

const startServer = async (): Promise<void> => {
   try {
      await connectDB();
      server = app.listen(port, host, () => {
         console.log(`Server running at http://${host}:${port}`);
      });
   } catch (err) {
      console.error('Failed to start server', err);
      process.exit(1);
   }
};

startServer();

// Graceful shutdown signals
console.log('Signal handlers attached');
process.on('SIGINT', () => gracefulShutdown('SIGINT', server));
process.on('SIGINT', () => {
   console.log('👋 SIGINT caught by fallback handler');
});
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));

// Extra guards
process.on('beforeExit', code => {
   console.log(`⚠️ beforeExit with code ${code}`);
});
process.on('exit', code => console.log(`Process exiting with code: ${code}`));
process.on('uncaughtException', err => {
   console.error('Uncaught Exception', err);
   closeDB();
});
process.on('unhandledRejection', err => {
   console.error('Unhandled Rejection', err);
   closeDB();
});

app.disable('x-powered-by'); // Hide Express fingerprint
