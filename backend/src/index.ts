import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { TwitterService } from "./services/twitter/client";
import { db } from "./services/db";
import config from "./config/config";
import { 
  logger, 
  startSpinner, 
  succeedSpinner, 
  failSpinner, 
  cleanup 
} from "./utils/logger";

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
}

// API Routes
app.get('/api/submissions', (req, res) => {
  try {
    const status = req.query.status as "pending" | "approved" | "rejected";
    const submissions = status ? 
      db.getSubmissionsByStatus(status) : 
      db.getAllSubmissions();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.get('/api/submissions/:tweetId', (req, res) => {
  try {
    const submission = db.getSubmission(req.params.tweetId);
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Serve frontend for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

async function main() {
  try {
    // Load environment variables
    startSpinner('env', 'Loading environment variables...');
    dotenv.config();
    succeedSpinner('env', 'Environment variables loaded');

    // Initialize Twitter service
    startSpinner('twitter-init', 'Initializing Twitter service...');
    const twitterService = new TwitterService(config.twitter);
    await twitterService.initialize();
    succeedSpinner('twitter-init', 'Twitter service initialized');

    // Start Express server
    startSpinner('express', 'Starting Express server...');
    app.listen(PORT, () => {
      succeedSpinner('express', `Express server running on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      startSpinner('shutdown', 'Shutting down gracefully...');
      try {
        await twitterService.stop();
        succeedSpinner('shutdown', 'Shutdown complete');
        process.exit(0);
      } catch (error) {
        failSpinner('shutdown', 'Error during shutdown');
        logger.error('Shutdown', error);
        process.exit(1);
      }
    });

    logger.info('🚀 Bot is running and ready for events', {
      twitterEnabled: true
    });

    // Start checking for mentions
    startSpinner('twitter-mentions', 'Starting mentions check...');
    await twitterService.startMentionsCheck();
    succeedSpinner('twitter-mentions', 'Mentions check started');

  } catch (error) {
    // Handle any initialization errors
    ['env', 'twitter-init', 'twitter-mentions', 'express'].forEach(key => {
      failSpinner(key, `Failed during ${key}`);
    });
    logger.error('Startup', error);
    cleanup();
    process.exit(1);
  }
}

// Start the application
logger.info('Starting Public Goods News Bot...');
main().catch((error) => {
  logger.error('Unhandled Exception', error);
  process.exit(1);
});
