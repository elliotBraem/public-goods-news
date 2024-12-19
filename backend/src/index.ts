import dotenv from "dotenv";
import path from "path";
import { TwitterService } from "./services/twitter/client";
import { db } from "./services/db";
import { WebSocketService } from "./services/websocket";
import config, { validateEnv } from "./config/config";
import { 
  logger, 
  startSpinner, 
  succeedSpinner, 
  failSpinner, 
  cleanup 
} from "./utils/logger";

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  try {
    // Load environment variables
    startSpinner('env', 'Loading environment variables...');
    dotenv.config();
    validateEnv();
    succeedSpinner('env', 'Environment variables loaded');

    // Initialize Twitter service
    startSpinner('twitter-init', 'Initializing Twitter service...');
    const twitterService = new TwitterService(config.twitter);
    await twitterService.initialize();
    succeedSpinner('twitter-init', 'Twitter service initialized');

    // Initialize services
    startSpinner('server', 'Starting server...');
    const wsService = new WebSocketService();
    db.setWebSocketService(wsService);

    const server = Bun.serve({
      port: PORT,
      async fetch(req) {
        const url = new URL(req.url);

        // WebSocket upgrade
        if (url.pathname === '/ws') {
          if (server.upgrade(req)) {
            return;
          }
          return new Response('WebSocket upgrade failed', { status: 500 });
        }

        // API Routes
        if (url.pathname.startsWith('/api')) {
          try {
            if (url.pathname === '/api/submissions') {
              const status = url.searchParams.get('status') as "pending" | "approved" | "rejected" | null;
              const submissions = status ? 
                db.getSubmissionsByStatus(status) : 
                db.getAllSubmissions();
              return Response.json(submissions);
            }

            const match = url.pathname.match(/^\/api\/submissions\/(.+)$/);
            if (match) {
              const tweetId = match[1];
              const submission = db.getSubmission(tweetId);
              if (!submission) {
                return Response.json({ error: 'Submission not found' }, { status: 404 });
              }
              return Response.json(submission);
            }
          } catch (error) {
            return Response.json({ error: 'Internal server error' }, { status: 500 });
          }
        }

        // Serve static frontend files in production
        if (process.env.NODE_ENV === 'production') {
          const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
          const file = Bun.file(path.join(__dirname, '../../frontend/dist', filePath));
          if (await file.exists()) {
            return new Response(file);
          }
          // Fallback to index.html for client-side routing
          return new Response(Bun.file(path.join(__dirname, '../../frontend/dist/index.html')));
        }

        return new Response('Not found', { status: 404 });
      },
      websocket: wsService.getWebSocketConfig(),
    });
    succeedSpinner('server', `Server running on port ${PORT}`);

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
      twitterEnabled: true,
      websocketEnabled: true
    });

    // Start checking for mentions
    startSpinner('twitter-mentions', 'Starting mentions check...');
    await twitterService.startMentionsCheck();
    succeedSpinner('twitter-mentions', 'Mentions check started');

  } catch (error) {
    // Handle any initialization errors
    ['env', 'websocket', 'twitter-init', 'twitter-mentions', 'express'].forEach(key => {
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
