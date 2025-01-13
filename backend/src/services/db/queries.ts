import { and, eq, sql } from "drizzle-orm";
import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { moderationHistory, submissionCounts, submissions } from "./schema";
import { Moderation, TwitterSubmission } from "../../types";

export function saveSubmission(db: BunSQLiteDatabase, submission: TwitterSubmission) {
  return db.insert(submissions).values({
    tweetId: submission.tweetId,
    userId: submission.userId,
    username: submission.username,
    content: submission.content,
    description: submission.description,
    categories: submission.categories ? JSON.stringify(submission.categories) : null,
    status: submission.status,
    acknowledgmentTweetId: submission.acknowledgmentTweetId,
    createdAt: submission.createdAt,
    submittedAt: submission.submittedAt
  });
}

export function saveModerationAction(db: BunSQLiteDatabase, moderation: Moderation) {
  return db.insert(moderationHistory).values({
    tweetId: moderation.tweetId,
    adminId: moderation.adminId,
    action: moderation.action,
    timestamp: moderation.timestamp.toISOString(),
    note: moderation.note,
    categories: moderation.categories ? JSON.stringify(moderation.categories) : null
  });
}

export function updateSubmissionStatus(
  db: BunSQLiteDatabase,
  tweetId: string,
  status: TwitterSubmission["status"],
  moderationResponseTweetId: string
) {
  return db
    .update(submissions)
    .set({
      status,
      moderationResponseTweetId
    })
    .where(eq(submissions.tweetId, tweetId));
}

type DbSubmission = {
  tweetId: string;
  userId: string;
  username: string;
  content: string;
  description: string | null;
  categories: string | null;
  status: string;
  acknowledgmentTweetId: string | null;
  moderationResponseTweetId: string | null;
  createdAt: string;
  submittedAt: string;
  moderationHistory: string;
};

export function getSubmission(db: BunSQLiteDatabase, tweetId: string): TwitterSubmission | null {
  const result = db
    .select({
      tweetId: submissions.tweetId,
      userId: submissions.userId,
      username: submissions.username,
      content: submissions.content,
      description: submissions.description,
      categories: submissions.categories,
      status: submissions.status,
      acknowledgmentTweetId: submissions.acknowledgmentTweetId,
      moderationResponseTweetId: submissions.moderationResponseTweetId,
      createdAt: submissions.createdAt,
      submittedAt: sql<string>`COALESCE(${submissions.submittedAt}, ${submissions.createdAt})`,
      moderationHistory: sql<string>`json_group_array(
        json_object(
          'adminId', ${moderationHistory.adminId},
          'action', ${moderationHistory.action},
          'timestamp', ${moderationHistory.timestamp},
          'tweetId', ${moderationHistory.tweetId},
          'note', ${moderationHistory.note},
          'categories', ${moderationHistory.categories}
        )
      )`
    })
    .from(submissions)
    .leftJoin(moderationHistory, eq(submissions.tweetId, moderationHistory.tweetId))
    .where(eq(submissions.tweetId, tweetId))
    .groupBy(submissions.tweetId)
    .get();

  if (!result) return null;

  return {
    tweetId: result.tweetId,
    userId: result.userId,
    username: result.username,
    content: result.content,
    description: result.description ?? undefined,
    categories: result.categories ? JSON.parse(result.categories) : [],
    status: result.status as TwitterSubmission["status"],
    acknowledgmentTweetId: result.acknowledgmentTweetId ?? undefined,
    moderationResponseTweetId: result.moderationResponseTweetId ?? undefined,
    createdAt: result.createdAt,
    submittedAt: result.submittedAt,
    moderationHistory: result.moderationHistory
      ? JSON.parse(`[${result.moderationHistory}]`).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          categories: m.categories ? JSON.parse(m.categories) : undefined,
        }))
      : [],
  };
}

export function getSubmissionByAcknowledgmentTweetId(
  db: BunSQLiteDatabase,
  acknowledgmentTweetId: string
): TwitterSubmission | null {
  const result = db
    .select({
      tweetId: submissions.tweetId,
      userId: submissions.userId,
      username: submissions.username,
      content: submissions.content,
      description: submissions.description,
      categories: submissions.categories,
      status: submissions.status,
      acknowledgmentTweetId: submissions.acknowledgmentTweetId,
      moderationResponseTweetId: submissions.moderationResponseTweetId,
      createdAt: submissions.createdAt,
      submittedAt: sql<string>`COALESCE(${submissions.submittedAt}, ${submissions.createdAt})`,
      moderationHistory: sql<string>`json_group_array(
        CASE 
          WHEN ${moderationHistory.adminId} IS NULL THEN NULL
          ELSE json_object(
            'adminId', ${moderationHistory.adminId},
            'action', ${moderationHistory.action},
            'timestamp', ${moderationHistory.timestamp},
            'tweetId', ${moderationHistory.tweetId},
            'note', ${moderationHistory.note},
            'categories', ${moderationHistory.categories}
          )
        END
      )`
    })
    .from(submissions)
    .leftJoin(moderationHistory, eq(submissions.tweetId, moderationHistory.tweetId))
    .where(eq(submissions.acknowledgmentTweetId, acknowledgmentTweetId))
    .groupBy(submissions.tweetId)
    .get();

  if (!result) return null;

  return {
    tweetId: result.tweetId,
    userId: result.userId,
    username: result.username,
    content: result.content,
    description: result.description ?? undefined,
    categories: result.categories ? JSON.parse(result.categories) : [],
    status: result.status as TwitterSubmission["status"],
    acknowledgmentTweetId: result.acknowledgmentTweetId ?? undefined,
    moderationResponseTweetId: result.moderationResponseTweetId ?? undefined,
    createdAt: result.createdAt,
    submittedAt: result.submittedAt,
    moderationHistory: result.moderationHistory
      ? JSON.parse(`[${result.moderationHistory}]`).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          categories: m.categories ? JSON.parse(m.categories) : undefined,
        }))
      : [],
  };
}

export function getAllSubmissions(db: BunSQLiteDatabase): TwitterSubmission[] {
  const results = db
    .select({
      tweetId: submissions.tweetId,
      userId: submissions.userId,
      username: submissions.username,
      content: submissions.content,
      description: submissions.description,
      categories: submissions.categories,
      status: submissions.status,
      acknowledgmentTweetId: submissions.acknowledgmentTweetId,
      moderationResponseTweetId: submissions.moderationResponseTweetId,
      createdAt: submissions.createdAt,
      submittedAt: sql<string>`COALESCE(${submissions.submittedAt}, ${submissions.createdAt})`,
      moderationHistory: sql<string>`json_group_array(
        CASE 
          WHEN ${moderationHistory.adminId} IS NULL THEN NULL
          ELSE json_object(
            'adminId', ${moderationHistory.adminId},
            'action', ${moderationHistory.action},
            'timestamp', ${moderationHistory.timestamp},
            'tweetId', ${moderationHistory.tweetId},
            'note', ${moderationHistory.note},
            'categories', ${moderationHistory.categories}
          )
        END
      )`
    })
    .from(submissions)
    .leftJoin(moderationHistory, eq(submissions.tweetId, moderationHistory.tweetId))
    .groupBy(submissions.tweetId)
    .all();

  return results.map(result => ({
    tweetId: result.tweetId,
    userId: result.userId,
    username: result.username,
    content: result.content,
    description: result.description ?? undefined,
    categories: result.categories ? JSON.parse(result.categories) : [],
    status: result.status as TwitterSubmission["status"],
    acknowledgmentTweetId: result.acknowledgmentTweetId ?? undefined,
    moderationResponseTweetId: result.moderationResponseTweetId ?? undefined,
    createdAt: result.createdAt,
    submittedAt: result.submittedAt,
    moderationHistory: result.moderationHistory
      ? JSON.parse(result.moderationHistory)
          .filter((m: any) => m !== null)
          .map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
            categories: m.categories ? JSON.parse(m.categories) : undefined,
          }))
      : [],
  }));
}

export function getSubmissionsByStatus(
  db: BunSQLiteDatabase,
  status: TwitterSubmission["status"]
): TwitterSubmission[] {
  const results = db
    .select({
      tweetId: submissions.tweetId,
      userId: submissions.userId,
      username: submissions.username,
      content: submissions.content,
      description: submissions.description,
      categories: submissions.categories,
      status: submissions.status,
      acknowledgmentTweetId: submissions.acknowledgmentTweetId,
      moderationResponseTweetId: submissions.moderationResponseTweetId,
      createdAt: submissions.createdAt,
      submittedAt: sql<string>`COALESCE(${submissions.submittedAt}, ${submissions.createdAt})`,
      moderationHistory: sql<string>`json_group_array(
        CASE 
          WHEN ${moderationHistory.adminId} IS NULL THEN NULL
          ELSE json_object(
            'adminId', ${moderationHistory.adminId},
            'action', ${moderationHistory.action},
            'timestamp', ${moderationHistory.timestamp},
            'tweetId', ${moderationHistory.tweetId},
            'note', ${moderationHistory.note},
            'categories', ${moderationHistory.categories}
          )
        END
      )`
    })
    .from(submissions)
    .leftJoin(moderationHistory, eq(submissions.tweetId, moderationHistory.tweetId))
    .where(eq(submissions.status, status))
    .groupBy(submissions.tweetId)
    .all();

  return results.map(result => ({
    tweetId: result.tweetId,
    userId: result.userId,
    username: result.username,
    content: result.content,
    description: result.description ?? undefined,
    categories: result.categories ? JSON.parse(result.categories) : [],
    status: result.status as TwitterSubmission["status"],
    acknowledgmentTweetId: result.acknowledgmentTweetId ?? undefined,
    moderationResponseTweetId: result.moderationResponseTweetId ?? undefined,
    createdAt: result.createdAt,
    submittedAt: result.submittedAt,
    moderationHistory: result.moderationHistory
      ? JSON.parse(result.moderationHistory)
          .filter((m: any) => m !== null)
          .map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
            categories: m.categories ? JSON.parse(m.categories) : undefined,
          }))
      : [],
  }));
}

export function getDailySubmissionCount(db: BunSQLiteDatabase, userId: string): number {
  const today = new Date().toISOString().split("T")[0];

  // Clean up old entries first
  db.delete(submissionCounts)
    .where(sql`${submissionCounts.lastResetDate} < ${today}`);

  const result = db
    .select({ count: submissionCounts.count })
    .from(submissionCounts)
    .where(
      and(
        eq(submissionCounts.userId, userId),
        eq(submissionCounts.lastResetDate, today)
      )
    )
    .get();

  return result?.count ?? 0;
}

export function incrementDailySubmissionCount(db: BunSQLiteDatabase, userId: string): void {
  const today = new Date().toISOString().split("T")[0];

  db.insert(submissionCounts)
    .values({
      userId,
      count: 1,
      lastResetDate: today
    })
    .onConflictDoUpdate({
      target: submissionCounts.userId,
      set: {
        count: sql`CASE 
          WHEN ${submissionCounts.lastResetDate} < ${today} THEN 1
          ELSE ${submissionCounts.count} + 1
        END`,
        lastResetDate: today
      }
    })
    .run();
}

export function updateSubmissionAcknowledgment(
  db: BunSQLiteDatabase,
  tweetId: string,
  acknowledgmentTweetId: string
): void {
  db.update(submissions)
    .set({ acknowledgmentTweetId })
    .where(eq(submissions.tweetId, tweetId))
    .run();
}
