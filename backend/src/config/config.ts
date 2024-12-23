import { AppConfig, ExportConfig } from "../types";
import path from "path";

// Configure export services
const exports: ExportConfig[] = [];

// Add Telegram export if configured
if (process.env.TELEGRAM_ENABLED === "true") {
  exports.push({
    type: "telegram",
    enabled: true,
    module: "telegram",
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    channelId: process.env.TELEGRAM_CHANNEL_ID!,
  });
}

// Add RSS export if configured
if (process.env.RSS_ENABLED === "true") {
  exports.push({
    type: "rss",
    enabled: true,
    module: "rss",
    title: process.env.RSS_TITLE || "Public Goods News",
    description: process.env.RSS_DESCRIPTION || "Latest approved public goods submissions",
    feedPath: process.env.RSS_FEED_PATH || path.join(process.cwd(), "public", "feed.xml"),
    maxItems: process.env.RSS_MAX_ITEMS ? parseInt(process.env.RSS_MAX_ITEMS) : 100,
  });
}

// Add NEAR export if configured
if (process.env.NEAR_ENABLED === "true") {
  exports.push({
    type: "near",
    enabled: true,
    module: "near",
    networkId: process.env.NEAR_NETWORK_ID!,
    nodeUrl: process.env.NEAR_NODE_URL || "https://rpc.testnet.near.org",
    contractId: process.env.NEAR_CONTRACT_ID!,
    accountId: process.env.NEAR_ACCOUNT_ID!,
    privateKey: process.env.NEAR_PRIVATE_KEY!
  });
}

const config: AppConfig = {
  twitter: {
    username: process.env.TWITTER_USERNAME!,
    password: process.env.TWITTER_PASSWORD!,
    email: process.env.TWITTER_EMAIL!,
  },
  environment:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "development",
  exports,
};

export function validateEnv() {
  // Validate required Twitter credentials
  if (
    !process.env.TWITTER_USERNAME ||
    !process.env.TWITTER_PASSWORD ||
    !process.env.TWITTER_EMAIL
  ) {
    throw new Error(
      "Missing required Twitter credentials. Please ensure TWITTER_USERNAME, TWITTER_PASSWORD, and TWITTER_EMAIL are set in your environment variables.",
    );
  }

  // Validate Telegram config if enabled
  if (process.env.TELEGRAM_ENABLED === "true") {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
      throw new Error(
        "Telegram export is enabled but missing required configuration. Please ensure TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID are set in your environment variables.",
      );
    }
  }

  // Validate RSS config if enabled
  if (process.env.RSS_ENABLED === "true") {
    // RSS has reasonable defaults, so no validation needed
  }

  // Validate NEAR config if enabled
  if (process.env.NEAR_ENABLED === "true") {
    const requiredVars = [
      "NEAR_NETWORK_ID",
      "NEAR_CONTRACT_ID",
      "NEAR_ACCOUNT_ID",
      "NEAR_PRIVATE_KEY"
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(
        `NEAR export is enabled but missing required configuration. Please ensure ${missingVars.join(", ")} are set in your environment variables.`
      );
    }
  }
}

export default config;
