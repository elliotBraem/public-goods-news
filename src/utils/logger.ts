import winston from 'winston';
import { consoleFormat } from 'winston-console-format';
import ora, { Ora } from 'ora';

// Configure winston logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    consoleFormat({
      showMeta: true,
      metaStrip: ['timestamp', 'service'],
      inspectOptions: {
        depth: 1,
        colors: true,
        maxArrayLength: 10,
        breakLength: 120,
        compact: Infinity,
      },
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.padLevels(),
        winston.format.colorize({ all: true }),
      ),
    }),
  ],
});

// Spinner states
const spinners: { [key: string]: Ora } = {};

export const startSpinner = (key: string, text: string): void => {
  if (spinners[key]) {
    spinners[key].text = text;
    return;
  }
  spinners[key] = ora({
    text,
    color: 'cyan',
    spinner: 'dots',
  }).start();
};

export const updateSpinner = (key: string, text: string): void => {
  if (spinners[key]) {
    spinners[key].text = text;
  }
};

export const succeedSpinner = (key: string, text?: string): void => {
  if (spinners[key]) {
    spinners[key].succeed(text);
    delete spinners[key];
  }
};

export const failSpinner = (key: string, text?: string): void => {
  if (spinners[key]) {
    spinners[key].fail(text);
    delete spinners[key];
  }
};

export const clearSpinner = (key: string): void => {
  if (spinners[key]) {
    spinners[key].stop();
    delete spinners[key];
  }
};

// Error handling
export const handleError = (error: unknown, context: string): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(`${context}: ${errorMessage}`, {
    error,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Cleanup function to clear all spinners
export const cleanup = (): void => {
  Object.keys(spinners).forEach((key) => {
    clearSpinner(key);
  });
};

// Register cleanup on process exit
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
