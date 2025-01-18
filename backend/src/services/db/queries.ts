import { and, eq, sql } from "drizzle-orm";
import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { SubmissionFeed, Moderation, TwitterSubmission, SubmissionStatus } from "types/twitter";
import {
  feedPlugins,
  feeds,
  moderationHistory,
  submissionCounts,
  submissionFeeds,
  submissions,
} from "./schema";

export function upsertFeed(
  db: BunSQLiteDatabase,
  feed: { id: string; name: string; description?: string },
) {
  return db
    .insert(feeds)
    .values({
      id: feed.id,
      name: feed.name,
      description: feed.description,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: feeds.id,
      set: {
        name: feed.name,
        description: feed.description,
      },
    });
}

export function saveSubmissionToFeed(
  db: BunSQLiteDatabase,
  submissionId: string,
  feedId: string,
  status: SubmissionStatus = SubmissionStatus.PENDING
) {
  return db
    .insert(submissionFeeds)
    .values({
      submissionId,
      feedId,
      status
    })
    .onConflictDoNothing();
}

export function getFeedsBySubmission(
  db: BunSQLiteDatabase,
  submissionId: string,
): SubmissionFeed[] {
  const results = db
    .select({
      submissionId: submissionFeeds.submissionId,
      feedId: submissionFeeds.feedId,
      status: submissionFeeds.status,
      moderationResponseTweetId: submissionFeeds.moderationResponseTweetId,
    })
    .from(submissionFeeds)
    .where(eq(submissionFeeds.submissionId, submissionId))
    .all();

  return results.map(result => ({
    ...result,
    moderationResponseTweetId: result.moderationResponseTweetId ?? undefined
  }));
}

export function saveSubmission(
  db: BunSQLiteDatabase,
  submission: TwitterSubmission,
) {
  return db.insert(submissions).values({
    tweetId: submission.tweetId,
    userId: submission.userId,
    username: submission.username,
    content: submission.content,
    curatorNotes: submission.curatorNotes,
    curatorId: submission.curatorId,
    curatorUsername: submission.curatorUsername,
    curatorTweetId: submission.curatorTweetId,
    createdAt: submission.createdAt,
    submittedAt: submission.submittedAt,
  });
}

export function saveModerationAction(
  db: BunSQLiteDatabase,
  moderation: Moderation,
) {
  return db.insert(moderationHistory).values({
    tweetId: moderation.tweetId,
    feedId: moderation.feedId,
    adminId: moderation.adminId,
    action: moderation.action,
    note: moderation.note,
    createdAt: moderation.timestamp.toISOString(),
  });
}

export function getModerationHistory(
  db: BunSQLiteDatabase,
  tweetId: string,
): Moderation[] {
  const results = db
    .select({
      tweetId: moderationHistory.tweetId,
      feedId: moderationHistory.feedId,
      adminId: moderationHistory.adminId,
      action: moderationHistory.action,
      note: moderationHistory.note,
      createdAt: moderationHistory.createdAt,
    })
    .from(moderationHistory)
    .where(eq(moderationHistory.tweetId, tweetId))
    .orderBy(moderationHistory.createdAt)
    .all();

  return results.map(result => ({
    tweetId: result.tweetId,
    feedId: result.feedId,
    adminId: result.adminId,
    action: result.action as "approve" | "reject",
    note: result.note ?? undefined,
    timestamp: new Date(result.createdAt),
  }));
}

export function updateSubmissionFeedStatus(
  db: BunSQLiteDatabase,
  submissionId: string,
  feedId: string,
  status: SubmissionStatus,
  moderationResponseTweetId: string,
) {
  return db
    .update(submissionFeeds)
    .set({
      status,
      moderationResponseTweetId,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(submissionFeeds.submissionId, submissionId),
        eq(submissionFeeds.feedId, feedId)
      )
    );
}

export function getSubmission(
  db: BunSQLiteDatabase,
  tweetId: string,
): TwitterSubmission | null {
  const result = db
    .select({
      tweetId: submissions.tweetId,
      userId: submissions.userId,
      username: submissions.username,
      content: submissions.content,
      curatorNotes: submissions.curatorNotes,
      curatorId: submissions.curatorId,
      curatorUsername: submissions.curatorUsername,
      curatorTweetId: submissions.curatorTweetId,
      createdAt: submissions.createdAt,
      submittedAt: sql<string>`COALESCE(${submissions.submittedAt}, ${submissions.createdAt})`,
    })
    .from(submissions)
    .where(eq(submissions.tweetId, tweetId))
    .get();

  if (!result) return null;

  const moderationHistory = getModerationHistory(db, tweetId);

  return {
    tweetId: result.tweetId,
    userId: result.userId,
    username: result.username,
    content: result.content,
    curatorNotes: result.curatorNotes ?? undefined,
    curatorId: result.curatorId,
    curatorUsername: result.curatorUsername,
    curatorTweetId: result.curatorTweetId,
    createdAt: result.createdAt,
    submittedAt: result.submittedAt,
    moderationHistory,
  };
}

export function getAllSubmissions(db: BunSQLiteDatabase): TwitterSubmission[] {
  const results = db
    .select({
      tweetId: submissions.tweetId,
      userId: submissions.userId,
      username: submissions.username,
      content: submissions.content,
      curatorNotes: submissions.curatorNotes,
      curatorId: submissions.curatorId,
      curatorUsername: submissions.curatorUsername,
      curatorTweetId: submissions.curatorTweetId,
      createdAt: submissions.createdAt,
      submittedAt: sql<string>`COALESCE(${submissions.submittedAt}, ${submissions.createdAt})`,
    })
    .from(submissions)
    .all();

  return results.map((result) => {
    const moderationHistory = getModerationHistory(db, result.tweetId);
    return {
      tweetId: result.tweetId,
      userId: result.userId,
      username: result.username,
      content: result.content,
      curatorNotes: result.curatorNotes ?? undefined,
      curatorId: result.curatorId,
      curatorUsername: result.curatorUsername,
      curatorTweetId: result.curatorTweetId,
      createdAt: result.createdAt,
      submittedAt: result.submittedAt,
      moderationHistory,
    };
  });
}

export function cleanupOldSubmissionCounts(
  db: BunSQLiteDatabase,
  date: string,
) {
  return db
    .delete(submissionCounts)
    .where(sql`${submissionCounts.lastResetDate} < ${date}`);
}

export function getDailySubmissionCount(
  db: BunSQLiteDatabase,
  userId: string,
  date: string,
): number {
  const result = db
    .select({ count: submissionCounts.count })
    .from(submissionCounts)
    .where(
      and(
        eq(submissionCounts.userId, userId),
        eq(submissionCounts.lastResetDate, date),
      ),
    )
    .get();

  return result?.count ?? 0;
}

export function incrementDailySubmissionCount(
  db: BunSQLiteDatabase,
  userId: string,
) {
  const today = new Date().toISOString().split("T")[0];

  return db
    .insert(submissionCounts)
    .values({
      userId,
      count: 1,
      lastResetDate: today,
    })
    .onConflictDoUpdate({
      target: submissionCounts.userId,
      set: {
        count: sql`CASE 
          WHEN ${submissionCounts.lastResetDate} < ${today} THEN 1
          ELSE ${submissionCounts.count} + 1
        END`,
        lastResetDate: today,
      },
    });
}

export function removeFromSubmissionFeed(
  db: BunSQLiteDatabase,
  submissionId: string,
  feedId: string,
) {
  return db
    .delete(submissionFeeds)
    .where(
      and(
        eq(submissionFeeds.submissionId, submissionId),
        eq(submissionFeeds.feedId, feedId),
      ),
    );
}

// Feed Plugin queries
export function getFeedPlugin(
  db: BunSQLiteDatabase,
  feedId: string,
  pluginId: string,
) {
  return db
    .select()
    .from(feedPlugins)
    .where(
      and(eq(feedPlugins.feedId, feedId), eq(feedPlugins.pluginId, pluginId)),
    )
    .get();
}

export function upsertFeedPlugin(
  db: BunSQLiteDatabase,
  feedId: string,
  pluginId: string,
  config: Record<string, any>,
) {
  return db
    .insert(feedPlugins)
    .values({
      feedId,
      pluginId,
      config: JSON.stringify(config),
    })
    .onConflictDoUpdate({
      target: [feedPlugins.feedId, feedPlugins.pluginId],
      set: {
        config: JSON.stringify(config),
        updatedAt: new Date().toISOString(),
      },
    });
}

export function getSubmissionsByFeed(
  db: BunSQLiteDatabase,
  feedId: string,
): TwitterSubmission[] {
  const results = db
    .select({
      tweetId: submissions.tweetId,
      userId: submissions.userId,
      username: submissions.username,
      content: submissions.content,
      curatorNotes: submissions.curatorNotes,
      curatorId: submissions.curatorId,
      curatorUsername: submissions.curatorUsername,
      curatorTweetId: submissions.curatorTweetId,
      createdAt: submissions.createdAt,
      submittedAt: sql<string>`COALESCE(${submissions.submittedAt}, ${submissions.createdAt})`,
    })
    .from(submissions)
    .innerJoin(
      submissionFeeds,
      eq(submissions.tweetId, submissionFeeds.submissionId),
    )
    .where(eq(submissionFeeds.feedId, feedId))
    .all();

  return results.map((result) => {
    const moderationHistory = getModerationHistory(db, result.tweetId);
    return {
      tweetId: result.tweetId,
      userId: result.userId,
      username: result.username,
      content: result.content,
      curatorNotes: result.curatorNotes ?? undefined,
      curatorId: result.curatorId,
      curatorUsername: result.curatorUsername,
      curatorTweetId: result.curatorTweetId,
      createdAt: result.createdAt,
      submittedAt: result.submittedAt,
      moderationHistory,
    };
  });
}
