import { LoggingWinston } from "@google-cloud/logging-winston";
import winston from "winston";

const loggingWinston = new LoggingWinston({
  projectId: "aurox-swaps",
  credentials: {
    type: "service_account",
    private_key: process.env.LOGGING_PRIVATE_KEY,
    client_email: "",
    client_id: "",
  },
  logName: "bull-winston",
});

const Colors: any = {
  info: "\x1b[36m",
  error: "\x1b[31m",
  warn: "\x1b[33m",
  verbose: "\x1b[43m",
};

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const message =
      typeof info.message === "string"
        ? info.message
        : JSON.stringify(info.message);

    return `\x1b[2m${info.timestamp}\x1b[0m [${
      Colors[info.level]
    }${info.level.toUpperCase()}\x1b[0m]: ${message}`;
  })
);

export const loggerOptions = {
  transports:
    process.env.NODE_ENV === "production"
      ? [loggingWinston]
      : [new winston.transports.Console({ format })],
};

const logger = winston.createLogger(loggerOptions);

export default logger;
