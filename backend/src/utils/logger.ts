import winston from "winston";
import { consoleFormat } from "winston-console-format";
import ora, { Ora } from "ora";

// Configure winston logger
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    consoleFormat({
      showMeta: true,
      metaStrip: ["timestamp", "service"],
      inspectOptions: {
        depth: 4, // Increased depth for better error inspection
        colors: true,
        maxArrayLength: 10,
        breakLength: 120,
        compact: Infinity,
      },
    }),
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
    text: `${text}\n`,
    color: "cyan",
    spinner: "dots",
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

// Interface for error details
interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  context: string;
  timestamp: string;
  type?: string;
  possibleCause?: string;
  [key: string]: unknown; // Index signature for additional properties
}

// Cleanup function to clear all spinners
export const cleanup = (): void => {
  Object.keys(spinners).forEach((key) => {
    clearSpinner(key);
  });
};

// Register cleanup on process exit
process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
