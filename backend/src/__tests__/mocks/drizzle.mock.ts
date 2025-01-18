import { mock } from "bun:test";
import { SubmissionStatus } from "../../services/db/schema";

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
}

// Create mock functions for each database operation
export const drizzleMock = {
  upsertFeed: mock<DbInterface["upsertFeed"]>(() => {}),
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
};

// Mock the db module
import { db } from "../../services/db";
Object.assign(db, drizzleMock);

export default drizzleMock;
