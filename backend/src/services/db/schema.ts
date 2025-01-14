import { integer, sqliteTable as table, text, primaryKey } from "drizzle-orm/sqlite-core";

export const feeds = table("feeds", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const submissions = table("submissions", {
  tweetId: text("tweet_id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  description: text("description"),
  categories: text("categories"),
  status: text("status").notNull().default("pending"),
  acknowledgmentTweetId: text("acknowledgment_tweet_id"),
  moderationResponseTweetId: text("moderation_response_tweet_id"),
  createdAt: text("created_at").notNull(),
  submittedAt: text("submitted_at"),
});

export const moderationHistory = table("moderation_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tweetId: text("tweet_id")
    .notNull()
    .references(() => submissions.tweetId),
  adminId: text("admin_id").notNull(),
  action: text("action").notNull(),
  timestamp: text("timestamp").notNull(),
  note: text("note"),
  categories: text("categories"),
});

export const submissionCounts = table("submission_counts", {
  userId: text("user_id").primaryKey(),
  count: integer("count").notNull().default(0),
  lastResetDate: text("last_reset_date").notNull(),
});

// Indexes
export const submissionCountsDateIndex = table("idx_submission_counts_date", {
  lastResetDate: text("last_reset_date"),
});

export const submissionAckIndex = table("idx_acknowledgment_tweet_id", {
  acknowledgmentTweetId: text("acknowledgment_tweet_id"),
});

export const submissionFeeds = table("submission_feeds", {
  submissionId: text("submission_id")
    .notNull()
    .references(() => submissions.tweetId),
  feedId: text("feed_id")
    .notNull()
    .references(() => feeds.id),
}, (t) => ({
  pk: primaryKey(t.submissionId, t.feedId),
}));
