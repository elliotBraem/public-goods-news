import { mock } from "bun:test";
import { SubmissionFeed, TwitterSubmission } from "../../types/twitter";

// In-memory storage for mock database
const storage = {
  submissions: new Map<string, TwitterSubmission>(),
  submissionFeeds: new Map<string, Map<string, {status: string, moderationResponseTweetId?: string}>>(), // tweetId -> Map<feedId, status>
  dailySubmissionCounts: new Map<string, number>(), // userId -> count
  moderationResponses: new Map<string, string>(), // tweetId -> responseTweetId
};

export const mockDb = {
  upsertFeed: mock<
    (feed: { id: string; name: string; description?: string }) => void
  >(() => {}),

  getDailySubmissionCount: mock<(userId: string) => number>((userId) => {
    return storage.dailySubmissionCounts.get(userId) || 0;
  }),

  saveSubmission: mock<(submission: TwitterSubmission) => void>(
    (submission) => {
      storage.submissions.set(submission.tweetId, submission);
    },
  ),

  saveSubmissionToFeed: mock<(submissionId: string, feedId: string, status?: string) => void>(
    (submissionId, feedId, status = "pending") => {
      const feeds = storage.submissionFeeds.get(submissionId) || new Map();
      feeds.set(feedId, {status});
      storage.submissionFeeds.set(submissionId, feeds);
    },
  ),

  incrementDailySubmissionCount: mock<(userId: string) => void>((userId) => {
    const currentCount = storage.dailySubmissionCounts.get(userId) || 0;
    storage.dailySubmissionCounts.set(userId, currentCount + 1);
  }),

  saveModerationAction: mock<(moderation: any) => void>(() => {}),

  getFeedsBySubmission: mock<(submissionId: string) => SubmissionFeed[]>((submissionId) => {
    const feeds = storage.submissionFeeds.get(submissionId) || new Map();
    return Array.from(feeds.entries()).map(([feedId, data]) => ({ 
      submissionId,
      feedId,
      status: data.status || "pending",
      moderationResponseTweetId: data.moderationResponseTweetId
    }));
  }),

  removeFromSubmissionFeed: mock<
    (submissionId: string, feedId: string) => void
  >((submissionId, feedId) => {
    const feeds = storage.submissionFeeds.get(submissionId);
    if (feeds) {
      feeds.delete(feedId);
    }
  }),

  updateSubmissionFeedStatus: mock<
    (submissionId: string, feedId: string, status: string, moderationTweetId: string) => void
  >((submissionId, feedId, status, moderationTweetId) => {
    const feeds = storage.submissionFeeds.get(submissionId) || new Map();
    feeds.set(feedId, {status, moderationResponseTweetId: moderationTweetId});
    storage.submissionFeeds.set(submissionId, feeds);
  }),

  getSubmission: mock<(tweetId: string) => TwitterSubmission | undefined>(
    (tweetId) => storage.submissions.get(tweetId)
  ),
};

// Helper to reset all mock functions and storage
export const resetMockDb = () => {
  Object.values(mockDb).forEach((mockFn) => mockFn.mockReset());
  storage.submissions.clear();
  storage.submissionFeeds.clear();
  storage.dailySubmissionCounts.clear();
  storage.moderationResponses.clear();
};
