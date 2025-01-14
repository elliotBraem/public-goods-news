import { Database } from "bun:sqlite";
import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { join } from "node:path";
import { broadcastUpdate } from "../../index";
import { Moderation, TwitterSubmission } from "../../types";
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
}

// Export a singleton instance
export const db = new DatabaseService();
