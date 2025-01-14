import { Database } from "bun:sqlite";
import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { join } from "node:path";
import { Moderation, TwitterSubmission } from "types/twitter";
import { broadcastUpdate } from "../../index";
import * as queries from "./queries";

export class DatabaseService {
  private db: BunSQLiteDatabase;
  private static readonly DB_PATH =
    process.env.DATABASE_URL?.replace("file:", "") ||
    join(".db", "submissions.sqlite");

  constructor() {
    const sqlite = new Database(DatabaseService.DB_PATH, { create: true });
    this.db = drizzle(sqlite);
  }

  private notifyUpdate() {
    const submissions = this.getAllSubmissions();
    broadcastUpdate({
      type: "update",
      data: submissions,
    });
  }

  saveSubmission(submission: TwitterSubmission): void {
    queries.saveSubmission(this.db, submission);
    this.notifyUpdate();
  }

  saveModerationAction(moderation: Moderation): void {
    queries.saveModerationAction(this.db, moderation);
    this.notifyUpdate();
  }

  updateSubmissionStatus(
    tweetId: string,
    status: TwitterSubmission["status"],
    moderationResponseTweetId: string,
  ): void {
    queries.updateSubmissionStatus(
      this.db,
      tweetId,
      status,
      moderationResponseTweetId,
    );
    this.notifyUpdate();
  }

  getSubmission(tweetId: string): TwitterSubmission | null {
    return queries.getSubmission(this.db, tweetId);
  }

  getSubmissionByAcknowledgmentTweetId(
    acknowledgmentTweetId: string,
  ): TwitterSubmission | null {
    return queries.getSubmissionByAcknowledgmentTweetId(
      this.db,
      acknowledgmentTweetId,
    );
  }

  getAllSubmissions(): TwitterSubmission[] {
    return queries.getAllSubmissions(this.db);
  }

  getSubmissionsByStatus(
    status: TwitterSubmission["status"],
  ): TwitterSubmission[] {
    return queries.getSubmissionsByStatus(this.db, status);
  }

  getDailySubmissionCount(userId: string): number {
    return queries.getDailySubmissionCount(this.db, userId);
  }

  incrementDailySubmissionCount(userId: string): void {
    queries.incrementDailySubmissionCount(this.db, userId);
  }

  updateSubmissionAcknowledgment(
    tweetId: string,
    acknowledgmentTweetId: string,
  ): void {
    queries.updateSubmissionAcknowledgment(
      this.db,
      tweetId,
      acknowledgmentTweetId,
    );
    this.notifyUpdate();
  }

  upsertFeed(feed: { id: string; name: string; description?: string }): void {
    queries.upsertFeed(this.db, feed);
  }

  saveSubmissionToFeed(submissionId: string, feedId: string): void {
    queries.saveSubmissionToFeed(this.db, submissionId, feedId);
  }

  getSubmissionFeeds(submissionId: string): { feedId: string }[] {
    return queries.getSubmissionFeeds(this.db, submissionId);
  }

  removeFromSubmissionFeed(submissionId: string, feedId: string): void {
    queries.removeFromSubmissionFeed(this.db, submissionId, feedId);
    this.notifyUpdate();
  }
}

// Export a singleton instance
export const db = new DatabaseService();
