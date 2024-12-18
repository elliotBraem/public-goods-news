import { Database } from "bun:sqlite";
import { TwitterSubmission, Moderation } from "../../types";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import { broadcastUpdate } from "../../index";

export class DatabaseService {
  private db: Database;
  private static readonly DB_PATH =
    process.env.DATABASE_URL?.replace("file:", "") ||
    join(".db", "submissions.sqlite");

  constructor() {
    this.ensureDbDirectory();
    this.db = new Database(DatabaseService.DB_PATH);
    this.initialize();
  }

  private notifyUpdate() {
    const submissions = this.getAllSubmissions();
    broadcastUpdate({
      type: "update",
      data: submissions,
    });
  }

  private ensureDbDirectory() {
    const dbDir = dirname(DatabaseService.DB_PATH);
    if (!existsSync(dbDir)) {
      mkdir(dbDir, { recursive: true });
    }
  }

  private initialize() {
    // Create submissions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS submissions (
        tweet_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        hashtags TEXT NOT NULL,
        category TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        acknowledgment_tweet_id TEXT,
        moderation_response_tweet_id TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Create moderation_history table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS moderation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tweet_id TEXT NOT NULL,
        admin_id TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        FOREIGN KEY (tweet_id) REFERENCES submissions(tweet_id)
      )
    `);

    // Create submission_counts table for rate limiting
    this.db.run(`
      CREATE TABLE IF NOT EXISTS submission_counts (
        user_id TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        last_reset_date TEXT NOT NULL
      )
    `);

    // Create twitter_state table for storing last checked tweet ID
    this.db.run(`
      CREATE TABLE IF NOT EXISTS twitter_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add index on last_reset_date for efficient cleanup
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_submission_counts_date 
      ON submission_counts(last_reset_date)
    `);

    // Add index on acknowledgment_tweet_id for faster lookups
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_acknowledgment_tweet_id
      ON submissions(acknowledgment_tweet_id)
    `);

    // Add new columns if they don't exist
    try {
      this.db.run(
        `ALTER TABLE submissions ADD COLUMN username TEXT NOT NULL DEFAULT ''`,
      );
    } catch (e) {
      // Column might already exist
    }
  }

  saveSubmission(submission: TwitterSubmission): void {
    const stmt = this.db.prepare(`
      INSERT INTO submissions (
        tweet_id, user_id, username, content, hashtags, category, description, status, 
        acknowledgment_tweet_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      submission.tweetId,
      submission.userId,
      submission.username,
      submission.content,
      JSON.stringify(submission.hashtags),
      submission.category || null,
      submission.description || null,
      submission.status,
      submission.acknowledgmentTweetId || null,
      submission.createdAt,
    );

    this.notifyUpdate();
  }

  saveModerationAction(moderation: Moderation): void {
    const stmt = this.db.prepare(`
      INSERT INTO moderation_history (
        tweet_id, admin_id, action, timestamp
      ) VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      moderation.tweetId,
      moderation.adminId,
      moderation.action,
      moderation.timestamp.toISOString(),
    );

    this.notifyUpdate();
  }

  updateSubmissionStatus(
    tweetId: string,
    status: TwitterSubmission["status"],
    moderationResponseTweetId: string,
  ): void {
    this.db
      .prepare(
        `
      UPDATE submissions 
      SET status = ?,
          moderation_response_tweet_id = ?
      WHERE tweet_id = ?
    `,
      )
      .run(status, moderationResponseTweetId, tweetId);

    this.notifyUpdate();
  }

  getSubmission(tweetId: string): TwitterSubmission | null {
    const submission = this.db
      .prepare(
        `
      SELECT s.*, GROUP_CONCAT(
        json_object(
          'adminId', m.admin_id,
          'action', m.action,
          'timestamp', m.timestamp,
          'tweetId', m.tweet_id
        )
      ) as moderation_history
      FROM submissions s
      LEFT JOIN moderation_history m ON s.tweet_id = m.tweet_id
      WHERE s.tweet_id = ?
      GROUP BY s.tweet_id
    `,
      )
      .get(tweetId) as any;

    if (!submission) return null;

    return {
      tweetId: submission.tweet_id,
      userId: submission.user_id,
      username: submission.username,
      content: submission.content,
      hashtags: JSON.parse(submission.hashtags),
      category: submission.category,
      description: submission.description,
      status: submission.status,
      acknowledgmentTweetId: submission.acknowledgment_tweet_id,
      moderationResponseTweetId: submission.moderation_response_tweet_id,
      createdAt: submission.created_at,
      moderationHistory: submission.moderation_history
        ? JSON.parse(`[${submission.moderation_history}]`).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        : [],
    };
  }

  getSubmissionByAcknowledgmentTweetId(
    acknowledgmentTweetId: string,
  ): TwitterSubmission | null {
    const submission = this.db
      .prepare(
        `
      SELECT s.*, GROUP_CONCAT(
        json_object(
          'adminId', m.admin_id,
          'action', m.action,
          'timestamp', m.timestamp,
          'tweetId', m.tweet_id
        )
      ) as moderation_history
      FROM submissions s
      LEFT JOIN moderation_history m ON s.tweet_id = m.tweet_id
      WHERE s.acknowledgment_tweet_id = ?
      GROUP BY s.tweet_id
    `,
      )
      .get(acknowledgmentTweetId) as any;

    if (!submission) return null;

    return {
      tweetId: submission.tweet_id,
      userId: submission.user_id,
      username: submission.username,
      content: submission.content,
      hashtags: JSON.parse(submission.hashtags),
      category: submission.category,
      description: submission.description,
      status: submission.status,
      acknowledgmentTweetId: submission.acknowledgment_tweet_id,
      moderationResponseTweetId: submission.moderation_response_tweet_id,
      createdAt: submission.created_at,
      moderationHistory: submission.moderation_history
        ? JSON.parse(`[${submission.moderation_history}]`).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        : [],
    };
  }

  getAllSubmissions(): TwitterSubmission[] {
    const submissions = this.db
      .prepare(
        `
      SELECT s.*, GROUP_CONCAT(
        json_object(
          'adminId', m.admin_id,
          'action', m.action,
          'timestamp', m.timestamp,
          'tweetId', m.tweet_id
        )
      ) as moderation_history
      FROM submissions s
      LEFT JOIN moderation_history m ON s.tweet_id = m.tweet_id
      GROUP BY s.tweet_id
    `,
      )
      .all() as any[];

    return submissions.map((submission) => ({
      tweetId: submission.tweet_id,
      userId: submission.user_id,
      username: submission.username,
      content: submission.content,
      hashtags: JSON.parse(submission.hashtags),
      category: submission.category,
      description: submission.description,
      status: submission.status,
      acknowledgmentTweetId: submission.acknowledgment_tweet_id,
      moderationResponseTweetId: submission.moderation_response_tweet_id,
      createdAt: submission.created_at,
      moderationHistory: submission.moderation_history
        ? JSON.parse(`[${submission.moderation_history}]`).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        : [],
    }));
  }

  getSubmissionsByStatus(
    status: TwitterSubmission["status"],
  ): TwitterSubmission[] {
    const submissions = this.db
      .prepare(
        `
      SELECT s.*, GROUP_CONCAT(
        json_object(
          'adminId', m.admin_id,
          'action', m.action,
          'timestamp', m.timestamp,
          'tweetId', m.tweet_id
        )
      ) as moderation_history
      FROM submissions s
      LEFT JOIN moderation_history m ON s.tweet_id = m.tweet_id
      WHERE s.status = ?
      GROUP BY s.tweet_id
    `,
      )
      .all(status) as any[];

    return submissions.map((submission) => ({
      tweetId: submission.tweet_id,
      userId: submission.user_id,
      username: submission.username,
      content: submission.content,
      hashtags: JSON.parse(submission.hashtags),
      category: submission.category,
      description: submission.description,
      status: submission.status,
      acknowledgmentTweetId: submission.acknowledgment_tweet_id,
      moderationResponseTweetId: submission.moderation_response_tweet_id,
      createdAt: submission.created_at,
      moderationHistory: submission.moderation_history
        ? JSON.parse(`[${submission.moderation_history}]`).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        : [],
    }));
  }

  // Rate limiting methods
  getDailySubmissionCount(userId: string): number {
    const today = new Date().toISOString().split("T")[0];

    // Clean up old entries first
    this.db
      .prepare(
        `
      DELETE FROM submission_counts 
      WHERE last_reset_date < ?
    `,
      )
      .run(today);

    const result = this.db
      .prepare(
        `
      SELECT count 
      FROM submission_counts 
      WHERE user_id = ? AND last_reset_date = ?
    `,
      )
      .get(userId, today) as { count: number } | undefined;

    return result?.count || 0;
  }

  incrementDailySubmissionCount(userId: string): void {
    const today = new Date().toISOString().split("T")[0];

    this.db
      .prepare(
        `
      INSERT INTO submission_counts (user_id, count, last_reset_date)
      VALUES (?, 1, ?)
      ON CONFLICT(user_id) DO UPDATE SET
      count = CASE 
        WHEN last_reset_date < ? THEN 1
        ELSE count + 1
      END,
      last_reset_date = ?
    `,
      )
      .run(userId, today, today, today);
  }

  // Last checked tweet ID methods
  getLastCheckedTweetId(): string | null {
    const result = this.db
      .prepare(
        `
      SELECT value 
      FROM twitter_state 
      WHERE key = 'last_checked_tweet_id'
    `,
      )
      .get() as { value: string } | undefined;

    return result?.value || null;
  }

  saveLastCheckedTweetId(tweetId: string): void {
    this.db
      .prepare(
        `
      INSERT INTO twitter_state (key, value, updated_at)
      VALUES ('last_checked_tweet_id', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
      value = ?,
      updated_at = CURRENT_TIMESTAMP
    `,
      )
      .run(tweetId, tweetId);
  }

  updateSubmissionAcknowledgment(
    tweetId: string,
    acknowledgmentTweetId: string,
  ): void {
    this.db
      .prepare(
        `
      UPDATE submissions 
      SET acknowledgment_tweet_id = ? 
      WHERE tweet_id = ?
    `,
      )
      .run(acknowledgmentTweetId, tweetId);

    this.notifyUpdate();
  }
}

// Export a singleton instance
export const db = new DatabaseService();
