import dotenv from "dotenv";
import { TwitterService } from "./services/twitter/client";
import { NearService } from "./services/near";
import config from "./config/config";

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Initialize NEAR service
    const nearService = new NearService(config.near);

    // Initialize Twitter service
    const twitterService = new TwitterService(config.twitter.apiKey);
    await twitterService.initialize();

    // Start Twitter stream
    const stream = await twitterService.startStream();

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Shutting down...");
      stream.destroy();
      process.exit(0);
    });

    console.log("Bot is running...");
  } catch (error) {
    console.error("Error starting the bot:", error);
    process.exit(1);
  }
}

main().catch(console.error);
