import { mock } from "bun:test";
import { SubmissionStatus } from "../../services/db/schema";
import { TwitterCookie } from "../../types/twitter";

// Define interfaces to match our schema
interface Submission {
  tweetId: string;
  userId: string;
  username: string;
  curatorId: string;
  curatorUsername: string;
  curatorTweetId: string;
  content: string;
  description?: string;
  submittedAt?: string;
}

interface SubmissionFeed {
  submissionId: string;
  feedId: string;
  status: SubmissionStatus;
  moderationResponseTweetId?: string;
}

// Define the database interface to match our schema
interface DbInterface {
  upsertFeed: (feed: {
    id: string;
    name: string;
    description?: string;
  }) => void;
  getSubmissionByCuratorTweetId: (curatorTweetId: string) => Submission | null;
  getSubmission: (tweetId: string) => Submission | null;
  getDailySubmissionCount: (userId: string) => number;
  saveSubmission: (submission: Submission) => void;
  saveSubmissionToFeed: (
    submissionId: string,
    feedId: string,
    status: SubmissionStatus,
    moderationResponseTweetId?: string | null,
  ) => void;
  incrementDailySubmissionCount: (userId: string) => void;
  saveModerationAction: (moderation: {
    tweetId: string;
    adminId: string;
    action: string;
    note?: string;
  }) => void;
  updateSubmissionFeedStatus: (
    submissionId: string,
    feedId: string,
    status: SubmissionStatus,
    moderationResponseTweetId?: string | null,
  ) => void;
  getFeedsBySubmission: (submissionId: string) => Array<SubmissionFeed>;
  removeFromSubmissionFeed: (submissionId: string, feedId: string) => void;
  getTwitterCookies: (username: string) => TwitterCookie[] | null;
  setTwitterCookies: (username: string, cookies: TwitterCookie[]) => void;
  deleteTwitterCookies: (username: string) => void;
  getTwitterCacheValue: (key: string) => string | null;
  setTwitterCacheValue: (key: string, value: string) => void;
}

// Create mock functions for each database operation
export const drizzleMock = {
  upsertFeed: mock<DbInterface["upsertFeed"]>(() => {}),
  getSubmissionByCuratorTweetId: mock<
    DbInterface["getSubmissionByCuratorTweetId"]
  >(() => null),
  getSubmission: mock<DbInterface["getSubmission"]>(() => null),
  getDailySubmissionCount: mock<DbInterface["getDailySubmissionCount"]>(
    () => 0,
  ),
  saveSubmission: mock<DbInterface["saveSubmission"]>(() => {}),
  saveSubmissionToFeed: mock<DbInterface["saveSubmissionToFeed"]>(() => {}),
  incrementDailySubmissionCount: mock<
    DbInterface["incrementDailySubmissionCount"]
  >(() => {}),
  saveModerationAction: mock<DbInterface["saveModerationAction"]>(() => {}),
  updateSubmissionFeedStatus: mock<DbInterface["updateSubmissionFeedStatus"]>(
    () => {},
  ),
  getFeedsBySubmission: mock<DbInterface["getFeedsBySubmission"]>(() => []),
  removeFromSubmissionFeed: mock<DbInterface["removeFromSubmissionFeed"]>(
    () => {},
  ),
  getTwitterCookies: mock<DbInterface["getTwitterCookies"]>(() => null),
  setTwitterCookies: mock<DbInterface["setTwitterCookies"]>(() => {}),
  deleteTwitterCookies: mock<DbInterface["deleteTwitterCookies"]>(() => {}),
  getTwitterCacheValue: mock<DbInterface["getTwitterCacheValue"]>(() => null),
  setTwitterCacheValue: mock<DbInterface["setTwitterCacheValue"]>(() => {}),
};

// Mock the db module
import { db } from "../../services/db";
Object.assign(db, drizzleMock);

export default drizzleMock;
