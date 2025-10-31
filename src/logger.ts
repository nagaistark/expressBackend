import pino from 'pino';

const isDev = process.env.NODE_ENV?.toLowerCase() !== 'production';

const logger = pino({
   level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
   // Do NOT add production pretty-printing here. Leave JSON for aggregators.
});

export default logger;
