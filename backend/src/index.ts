import { ServerWebSocket } from "bun";
import dotenv from "dotenv";
import path from "path";
import configService, { validateEnv } from "./config/config";
import { db } from "./services/db";
import { TwitterService } from "./services/twitter/client";
import { ExportManager } from "./services/exports/manager";
import { SubmissionService } from "./services/submissions/submission.service";
import {
  cleanup,
  failSpinner,
  logger,
  startSpinner,
  succeedSpinner,
} from "./utils/logger";

const PORT = Number(process.env.PORT) || 3000;

// Store active WebSocket connections
const activeConnections = new Set<ServerWebSocket>();

// Broadcast to all connected clients
export function broadcastUpdate(data: unknown) {
  const message = JSON.stringify(data);
  activeConnections.forEach((ws) => {
    try {
      ws.send(message);
    } catch (error) {
      logger.error("Error broadcasting to WebSocket client:", error);
      activeConnections.delete(ws);
    }
  });
}

export async function main() {
  try {
    // Load environment variables and config
    startSpinner("env", "Loading environment variables and config...");
    dotenv.config();
    validateEnv();
    await configService.loadConfig();
    succeedSpinner("env", "Environment variables and config loaded");

    // Initialize services
    startSpinner("server", "Starting server...");

    const server = Bun.serve({
      port: PORT,
      async fetch(req) {
        const url = new URL(req.url);

        // WebSocket upgrade
        if (url.pathname === "/ws") {
          if (server?.upgrade(req)) {
            return;
          }
          return new Response("WebSocket upgrade failed", { status: 500 });
        }

        // API Routes
        if (url.pathname.startsWith("/api")) {
          try {
            if (url.pathname === "/api/last-tweet-id") {
              if (req.method === "GET") {
                const lastTweetId = twitterService.getLastCheckedTweetId();
                return Response.json({ lastTweetId });
              }

              if (req.method === "POST") {
                try {
                  const body = (await req.json()) as Record<string, unknown>;
                  if (!body?.tweetId || typeof body.tweetId !== "string") {
                    return Response.json(
                      { error: "Invalid tweetId" },
                      { status: 400 },
                    );
                  }
                  await twitterService.setLastCheckedTweetId(body.tweetId);
                  return Response.json({ success: true });
                } catch (error) {
                  return Response.json(
                    { error: "Invalid JSON payload" },
                    { status: 400 },
                  );
                }
              }
            }

            if (url.pathname === "/api/submissions") {
              const status = url.searchParams.get("status") as
                | "pending"
                | "approved"
                | "rejected"
                | null;
              const submissions = status
                ? db.getSubmissionsByStatus(status)
                : db.getAllSubmissions();
              return Response.json(submissions);
            }

            const match = url.pathname.match(/^\/api\/submissions\/(.+)$/);
            if (match) {
              const tweetId = match[1];
              const submission = db.getSubmission(tweetId);
              if (!submission) {
                return Response.json(
                  { error: "Submission not found" },
                  { status: 404 },
                );
              }
              return Response.json(submission);
            }
          } catch (error) {
            return Response.json(
              { error: "Internal server error" },
              { status: 500 },
            );
          }
        }

        // Serve static frontend files in production only
        if (process.env.NODE_ENV === "production") {
          const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
          const file = Bun.file(
            path.join(__dirname, "../../frontend/dist", filePath),
          );
          if (await file.exists()) {
            return new Response(file);
          }
          // Fallback to index.html for client-side routing
          return new Response(
            Bun.file(path.join(__dirname, "../../frontend/dist/index.html")),
          );
        }

        return new Response("Not found", { status: 404 });
      },
      websocket: {
        open: (ws: ServerWebSocket) => {
          activeConnections.add(ws);
          logger.debug(
            `WebSocket client connected. Total connections: ${activeConnections.size}`,
          );
        },
        close: (ws: ServerWebSocket) => {
          activeConnections.delete(ws);
          logger.debug(
            `WebSocket client disconnected. Total connections: ${activeConnections.size}`,
          );
        },
        message: (ws: ServerWebSocket, message: string | Buffer) => {
          // we don't care about two-way connection yet
        },
      },
    });

    succeedSpinner("server", `Server running on port ${PORT}`);

    // Initialize Twitter service
    startSpinner("twitter-init", "Initializing Twitter service...");
    const twitterService = new TwitterService({
      username: process.env.TWITTER_USERNAME!,
      password: process.env.TWITTER_PASSWORD!,
      email: process.env.TWITTER_EMAIL!
    });
    await twitterService.initialize();
    succeedSpinner("twitter-init", "Twitter service initialized");

    // Initialize export service
    startSpinner("export-init", "Initializing export service...");
    const exportManager = new ExportManager();
    const config = configService.getConfig();
    await exportManager.initialize(config.plugins);
    succeedSpinner("export-init", "Export service initialized");

    // Initialize submission service
    startSpinner("submission-init", "Initializing submission service...");
    const submissionService = new SubmissionService(
      twitterService,
      exportManager,
      config
    );
    await submissionService.initialize();
    succeedSpinner("submission-init", "Submission service initialized");

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      startSpinner("shutdown", "Shutting down gracefully...");
      try {
        await Promise.all([
          twitterService.stop(),
          submissionService.stop(),
          exportManager.shutdown()
        ]);
        succeedSpinner("shutdown", "Shutdown complete");
        process.exit(0);
      } catch (error) {
        failSpinner("shutdown", "Error during shutdown");
        logger.error("Shutdown", error);
        process.exit(1);
      }
    });

    logger.info("🚀 Bot is running and ready for events", {
      twitterEnabled: true,
      websocketEnabled: true,
      exportsEnabled: Object.keys(config.plugins).length > 0,
    });

    // Start checking for mentions
    startSpinner("submission-monitor", "Starting submission monitoring...");
    await submissionService.startMentionsCheck();
    succeedSpinner("submission-monitor", "Submission monitoring started");
  } catch (error) {
    // Handle any initialization errors
    [
      "env",
      "twitter-init",
      "export-init",
      "twitter-mentions",
      "server",
    ].forEach((key) => {
      failSpinner(key, `Failed during ${key}`);
    });
    logger.error("Startup", error);
    cleanup();
    process.exit(1);
  }
}

// Start the application
logger.info("Starting Public Goods News Bot...");
main().catch((error) => {
  logger.error("Unhandled Exception", error);
  process.exit(1);
});
