import dotenv from "dotenv";
import { TwitterService } from "./services/twitter/client";
import { NearService } from "./services/near";
import config from "./config/config";
import { 
  logger, 
  startSpinner, 
  succeedSpinner, 
  failSpinner, 
  handleError, 
  cleanup 
} from "./utils/logger";

async function main() {
  try {
    // Load environment variables
    startSpinner('env', 'Loading environment variables...');
    dotenv.config();
    succeedSpinner('env', 'Environment variables loaded');

    // Initialize NEAR service
    startSpinner('near', 'Initializing NEAR service...');
    const nearService = new NearService(config.near);
    succeedSpinner('near', 'NEAR service initialized');

    // Initialize Twitter service
    startSpinner('twitter-init', 'Initializing Twitter service...');
    const twitterService = new TwitterService(config.twitter);
    await twitterService.initialize();
    succeedSpinner('twitter-init', 'Twitter service initialized');

    // Start Twitter stream
    startSpinner('twitter-stream', 'Starting Twitter stream...');
    const stream = await twitterService.startStream();
    succeedSpinner('twitter-stream', 'Twitter stream started');

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      startSpinner('shutdown', 'Shutting down gracefully...');
      try {
        stream.destroy();
        succeedSpinner('shutdown', 'Shutdown complete');
        process.exit(0);
      } catch (error) {
        failSpinner('shutdown', 'Error during shutdown');
        handleError(error, 'Shutdown');
        process.exit(1);
      }
    });

    logger.info('🚀 Bot is running and ready for events', {
      nearNetwork: config.near.networkId,
      twitterEnabled: true
    });
  } catch (error) {
    // Handle any initialization errors
    ['env', 'near', 'twitter-init', 'twitter-stream'].forEach(key => {
      failSpinner(key, `Failed during ${key}`);
    });
    handleError(error, 'Startup');
    cleanup();
    process.exit(1);
  }
}

// Start the application
logger.info('Starting Public Goods News Bot...');
main().catch((error) => {
  handleError(error, 'Unhandled Exception');
  process.exit(1);
});
