import { mock } from "bun:test";
import { TwitterSubmission } from "../../types/twitter";

// In-memory storage for mock database
const storage = {
  submissions: new Map<string, TwitterSubmission>(),
  submissionFeeds: new Map<string, Set<string>>(), // tweetId -> Set of feedIds
  dailySubmissionCounts: new Map<string, number>(), // userId -> count
  acknowledgments: new Map<string, string>(), // tweetId -> acknowledgmentTweetId
  moderationResponses: new Map<string, string>(), // tweetId -> responseTweetId
};

export const mockDb = {
  upsertFeed: mock<(feed: { id: string; name: string; description?: string }) => void>(() => {}),
  
  getDailySubmissionCount: mock<(userId: string) => number>((userId) => {
    return storage.dailySubmissionCounts.get(userId) || 0;
  }),
  
  saveSubmission: mock<(submission: TwitterSubmission) => void>((submission) => {
    storage.submissions.set(submission.tweetId, submission);
  }),
  
  saveSubmissionToFeed: mock<(submissionId: string, feedId: string) => void>((submissionId, feedId) => {
    const feeds = storage.submissionFeeds.get(submissionId) || new Set();
    feeds.add(feedId);
    storage.submissionFeeds.set(submissionId, feeds);
  }),
  
  incrementDailySubmissionCount: mock<(userId: string) => void>((userId) => {
    const currentCount = storage.dailySubmissionCounts.get(userId) || 0;
    storage.dailySubmissionCounts.set(userId, currentCount + 1);
  }),
  
  updateSubmissionAcknowledgment: mock<(tweetId: string, acknowledgmentTweetId: string) => void>((tweetId, ackId) => {
    storage.acknowledgments.set(tweetId, ackId);
  }),
  
  getSubmissionByAcknowledgmentTweetId: mock<(acknowledgmentTweetId: string) => TwitterSubmission | null>((ackId) => {
    for (const [tweetId, storedAckId] of storage.acknowledgments.entries()) {
      if (storedAckId === ackId) {
        return storage.submissions.get(tweetId) || null;
      }
    }
    return null;
  }),
  
  saveModerationAction: mock<(moderation: any) => void>(() => {}),
  
  updateSubmissionStatus: mock<(tweetId: string, status: "approved" | "rejected", responseTweetId: string) => void>((tweetId, status, responseId) => {
    const submission = storage.submissions.get(tweetId);
    if (submission) {
      submission.status = status;
      storage.moderationResponses.set(tweetId, responseId);
    }
  }),
  
  getFeedsBySubmission: mock<(submissionId: string) => Array<{ feedId: string }>>((submissionId) => {
    const feeds = storage.submissionFeeds.get(submissionId) || new Set();
    return Array.from(feeds).map(feedId => ({ feedId }));
  }),
  
  removeFromSubmissionFeed: mock<(submissionId: string, feedId: string) => void>((submissionId, feedId) => {
    const feeds = storage.submissionFeeds.get(submissionId);
    if (feeds) {
      feeds.delete(feedId);
    }
  }),
};

// Helper to reset all mock functions and storage
export const resetMockDb = () => {
  Object.values(mockDb).forEach(mockFn => mockFn.mockReset());
  storage.submissions.clear();
  storage.submissionFeeds.clear();
  storage.dailySubmissionCounts.clear();
  storage.acknowledgments.clear();
  storage.moderationResponses.clear();
};
