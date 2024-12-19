import { AppConfig } from "../types";

const config: AppConfig = {
  twitter: {
    username: process.env.TWITTER_USERNAME!,
    password: process.env.TWITTER_PASSWORD!,
    email: process.env.TWITTER_EMAIL!
  },
  environment:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "development",
};

export function validateEnv() {
  // Validate required Twitter credentials
  if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD || !process.env.TWITTER_EMAIL) {
    throw new Error('Missing required Twitter credentials. Please ensure TWITTER_USERNAME, TWITTER_PASSWORD, and TWITTER_EMAIL are set in your environment variables.');
  }
}

export default config;
