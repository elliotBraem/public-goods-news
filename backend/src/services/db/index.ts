import { Database } from "bun:sqlite";
import { TwitterSubmission, Moderation } from "../../types";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import { broadcastUpdate } from "../../index";
import { logger } from "utils/logger";

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
        description TEXT,
        categories TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        acknowledgment_tweet_id TEXT,
        moderation_response_tweet_id TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Handle moderation_history table migration
    try {
      // Backup existing data
      this.db.run(`
        CREATE TABLE IF NOT EXISTS moderation_history_backup AS
        SELECT * FROM moderation_history;
      `);

      // Drop and recreate with correct schema
      this.db.run(`DROP TABLE IF EXISTS moderation_history`);
      this.db.run(`
        CREATE TABLE moderation_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tweet_id TEXT NOT NULL,
          admin_id TEXT NOT NULL,
          action TEXT NOT NULL,
          timestamp DATETIME NOT NULL,
          FOREIGN KEY (tweet_id) REFERENCES submissions(tweet_id)
        )
      `);

      // Restore data if backup exists
      this.db.run(`
        INSERT INTO moderation_history (tweet_id, admin_id, action, timestamp)
        SELECT tweet_id, admin_id, action, timestamp
        FROM moderation_history_backup;
      `);

      // Clean up backup
      this.db.run(`DROP TABLE IF EXISTS moderation_history_backup`);
    } catch (e) {
      // If no existing table, just create new one
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
    }

    // Create submission_counts table for rate limiting
    this.db.run(`
      CREATE TABLE IF NOT EXISTS submission_counts (
        user_id TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        last_reset_date TEXT NOT NULL
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

    try {
      this.db.run(`ALTER TABLE submissions ADD COLUMN categories TEXT`);
    } catch (e) {
      // Column might already exist
    }

    // Remove old columns
    try {
      // SQLite doesn't support DROP COLUMN before version 3.35.0
      // Instead, we need to recreate the table without those columns
      this.db.run(`
        CREATE TABLE IF NOT EXISTS submissions_new (
          tweet_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          username TEXT NOT NULL,
          content TEXT NOT NULL,
          description TEXT,
          categories TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          acknowledgment_tweet_id TEXT,
          moderation_response_tweet_id TEXT,
          created_at TEXT NOT NULL
        )
      `);

      this.db.run(`
        INSERT OR REPLACE INTO submissions_new 
        SELECT 
          tweet_id,
          user_id,
          username,
          content,
          description,
          categories,
          status,
          acknowledgment_tweet_id,
          moderation_response_tweet_id,
          created_at
        FROM submissions
      `);

      this.db.run(`DROP TABLE IF EXISTS submissions`);
      this.db.run(`ALTER TABLE submissions_new RENAME TO submissions`);

      // Recreate indexes
      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_acknowledgment_tweet_id
        ON submissions(acknowledgment_tweet_id)
      `);
    } catch (e) {
      // Table might not exist or other error
      logger.error("Error updating table structure:", e);
    }
  }

  saveSubmission(submission: TwitterSubmission): void {
    const stmt = this.db.prepare(`
      INSERT INTO submissions (
        tweet_id, user_id, username, content, description, categories, status, 
        acknowledgment_tweet_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      submission.tweetId,
      submission.userId,
      submission.username,
      submission.content,
      submission.description || null,
      submission.categories ? JSON.stringify(submission.categories) : null,
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
      SELECT s.*, json_group_array(
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
      description: submission.description,
      categories: submission.categories
        ? JSON.parse(submission.categories)
        : [],
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
      SELECT s.*, json_group_array(
        CASE 
          WHEN m.admin_id IS NULL THEN NULL
          ELSE json_object(
            'adminId', m.admin_id,
            'action', m.action,
            'timestamp', m.timestamp,
            'tweetId', m.tweet_id
          )
        END
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
      description: submission.description,
      categories: submission.categories
        ? JSON.parse(submission.categories)
        : [],
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
      SELECT s.*, json_group_array(
        CASE 
          WHEN m.admin_id IS NULL THEN NULL
          ELSE json_object(
            'adminId', m.admin_id,
            'action', m.action,
            'timestamp', m.timestamp,
            'tweetId', m.tweet_id
          )
        END
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
      description: submission.description,
      categories: submission.categories
        ? JSON.parse(submission.categories)
        : [],
      status: submission.status,
      acknowledgmentTweetId: submission.acknowledgment_tweet_id,
      moderationResponseTweetId: submission.moderation_response_tweet_id,
      createdAt: submission.created_at,
      moderationHistory: submission.moderation_history
        ? JSON.parse(submission.moderation_history)
            .filter((m: any) => m !== null)
            .map((m: any) => ({
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
      SELECT s.*, json_group_array(
        CASE 
          WHEN m.admin_id IS NULL THEN NULL
          ELSE json_object(
            'adminId', m.admin_id,
            'action', m.action,
            'timestamp', m.timestamp,
            'tweetId', m.tweet_id
          )
        END
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
      description: submission.description,
      categories: submission.categories
        ? JSON.parse(submission.categories)
        : [],
      status: submission.status,
      acknowledgmentTweetId: submission.acknowledgment_tweet_id,
      moderationResponseTweetId: submission.moderation_response_tweet_id,
      createdAt: submission.created_at,
      moderationHistory: submission.moderation_history
        ? JSON.parse(submission.moderation_history)
            .filter((m: any) => m !== null)
            .map((m: any) => ({
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
