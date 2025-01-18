import { Database } from "bun:sqlite";
import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { join } from "node:path";

import { logger } from "utils/logger";

import { DBOperations } from "./operations";
import * as queries from "./queries";

// Twitter & RSS
import {
  SubmissionFeed,
  Moderation,
  TwitterCookie,
  TwitterSubmission,
  SubmissionStatus,
} from "types/twitter";
import * as rssQueries from "../rss/queries";
import * as twitterQueries from "../twitter/queries";
export class DatabaseService {
  private db: BunSQLiteDatabase;
  private operations: DBOperations;
  private static readonly DB_PATH =
    process.env.DATABASE_URL?.replace("file:", "") ||
    join(".db", "submissions.sqlite");

  constructor() {
    const sqlite = new Database(DatabaseService.DB_PATH, { create: true });
    this.db = drizzle(sqlite);
    this.operations = new DBOperations(this.db);
  }

  getOperations(): DBOperations {
    return this.operations;
  }

  saveSubmission(submission: TwitterSubmission): void {
    queries.saveSubmission(this.db, submission).run();
  }

  saveModerationAction(moderation: Moderation): void {
    queries.saveModerationAction(this.db, moderation).run();
  }

  updateSubmissionFeedStatus(
    submissionId: string,
    feedId: string,
    status: SubmissionStatus,
    moderationResponseTweetId: string,
  ): void {
    queries
      .updateSubmissionFeedStatus(
        this.db,
        submissionId,
        feedId,
        status,
        moderationResponseTweetId,
      )
      .run();
  }

  getSubmission(tweetId: string): TwitterSubmission | null {
    return queries.getSubmission(this.db, tweetId);
  }

  getAllSubmissions(): TwitterSubmission[] {
    return queries.getAllSubmissions(this.db);
  }

  getDailySubmissionCount(userId: string): number {
    const today = new Date().toISOString().split("T")[0];
    // Clean up old entries first
    queries.cleanupOldSubmissionCounts(this.db, today).run();
    return queries.getDailySubmissionCount(this.db, userId, today);
  }

  incrementDailySubmissionCount(userId: string): void {
    queries.incrementDailySubmissionCount(this.db, userId).run();
  }

  upsertFeed(feed: { id: string; name: string; description?: string }): void {
    queries.upsertFeed(this.db, feed).run();
  }

  saveSubmissionToFeed(
    submissionId: string,
    feedId: string,
    status: SubmissionStatus = SubmissionStatus.PENDING,
  ): void {
    queries.saveSubmissionToFeed(this.db, submissionId, feedId, status).run();
  }

  getFeedsBySubmission(submissionId: string): SubmissionFeed[] {
    return queries.getFeedsBySubmission(this.db, submissionId);
  }

  removeFromSubmissionFeed(submissionId: string, feedId: string): void {
    queries.removeFromSubmissionFeed(this.db, submissionId, feedId).run();
  }

  getSubmissionsByFeed(feedId: string): TwitterSubmission[] {
    return queries.getSubmissionsByFeed(this.db, feedId);
  }

  getContent(contentId: string): TwitterSubmission | null {
    // For now, content is the same as submission since we're dealing with tweets
    return this.getSubmission(contentId);
  }

  // Feed Plugin Management
  getFeedPlugin(feedId: string, pluginId: string) {
    return queries.getFeedPlugin(this.db, feedId, pluginId);
  }

  upsertFeedPlugin(
    feedId: string,
    pluginId: string,
    config: Record<string, any>,
  ) {
    return queries.upsertFeedPlugin(this.db, feedId, pluginId, config).run();
  }

  // Twitter Cookie Management
  setTwitterCookies(username: string, cookies: TwitterCookie[] | null): void {
    const cookiesJson = JSON.stringify(cookies);
    twitterQueries.setTwitterCookies(this.db, username, cookiesJson).run();
  }

  getTwitterCookies(username: string): TwitterCookie[] | null {
    const result = twitterQueries.getTwitterCookies(this.db, username);
    if (!result) return null;

    try {
      return JSON.parse(result.cookies) as TwitterCookie[];
    } catch (e) {
      logger.error("Error parsing Twitter cookies:", e);
      return null;
    }
  }

  deleteTwitterCookies(username: string): void {
    twitterQueries.deleteTwitterCookies(this.db, username).run();
  }

  // Twitter Cache Management
  setTwitterCacheValue(key: string, value: string): void {
    try {
      twitterQueries.setTwitterCacheValue(this.db, key, value).run();
    } catch (error: any) {
      // Ignore write errors on read-only replicas
      if (
        error.code === "SQLITE_READONLY_DIRECTORY" ||
        error.message?.includes("readonly database")
      ) {
        logger.info(
          `Skipping Twitter cache write on read-only replica for key: ${key}`,
        );
        return;
      }
      throw error;
    }
  }

  getTwitterCacheValue(key: string): string | null {
    const result = twitterQueries.getTwitterCacheValue(this.db, key);
    return result?.value ?? null;
  }

  deleteTwitterCacheValue(key: string): void {
    twitterQueries.deleteTwitterCacheValue(this.db, key).run();
  }

  clearTwitterCache(): void {
    twitterQueries.clearTwitterCache(this.db).run();
  }

  // RSS Management
  saveRssItem(feedId: string, item: rssQueries.RssItem): void {
    rssQueries.saveRssItem(this.db, feedId, item).run();
  }

  getRssItems(feedId: string, limit?: number): rssQueries.RssItem[] {
    return rssQueries.getRssItems(this.db, feedId, limit);
  }

  deleteOldRssItems(feedId: string, limit: number): void {
    rssQueries.deleteOldRssItems(this.db, feedId, limit).run();
  }
}

// Export a singleton instance
export const db = new DatabaseService();
