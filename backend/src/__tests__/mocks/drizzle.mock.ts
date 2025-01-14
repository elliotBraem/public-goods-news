import { mock } from "bun:test";
import { TwitterSubmission } from "../../types/twitter";

// Define the database interface to match our schema
interface DbInterface {
  upsertFeed: (feed: {
    id: string;
    name: string;
    description?: string;
  }) => void;
  getDailySubmissionCount: (userId: string) => number;
  saveSubmission: (submission: TwitterSubmission) => void;
  saveSubmissionToFeed: (submissionId: string, feedId: string) => void;
  incrementDailySubmissionCount: (userId: string) => void;
  updateSubmissionAcknowledgment: (
    tweetId: string,
    acknowledgmentTweetId: string,
  ) => void;
  getSubmissionByAcknowledgmentTweetId: (
    acknowledgmentTweetId: string,
  ) => Promise<TwitterSubmission | null>;
  saveModerationAction: (moderation: any) => void;
  updateSubmissionStatus: (
    tweetId: string,
    status: "approved" | "rejected",
    responseTweetId: string,
  ) => void;
  getFeedsBySubmission: (
    submissionId: string,
  ) => Promise<Array<{ feedId: string }>>;
  removeFromSubmissionFeed: (submissionId: string, feedId: string) => void;
}

// Create mock functions for each database operation
export const drizzleMock = {
  upsertFeed: mock<DbInterface["upsertFeed"]>(() => {}),
  getDailySubmissionCount: mock<DbInterface["getDailySubmissionCount"]>(
    () => 0,
  ),
  saveSubmission: mock<DbInterface["saveSubmission"]>(() => {}),
  saveSubmissionToFeed: mock<DbInterface["saveSubmissionToFeed"]>(() => {}),
  incrementDailySubmissionCount: mock<
    DbInterface["incrementDailySubmissionCount"]
  >(() => {}),
  updateSubmissionAcknowledgment: mock<
    DbInterface["updateSubmissionAcknowledgment"]
  >(() => {}),
  getSubmissionByAcknowledgmentTweetId: mock<
    DbInterface["getSubmissionByAcknowledgmentTweetId"]
  >(() => Promise.resolve(null)),
  saveModerationAction: mock<DbInterface["saveModerationAction"]>(() => {}),
  updateSubmissionStatus: mock<DbInterface["updateSubmissionStatus"]>(() => {}),
  getFeedsBySubmission: mock<DbInterface["getFeedsBySubmission"]>(() =>
    Promise.resolve([]),
  ),
  removeFromSubmissionFeed: mock<DbInterface["removeFromSubmissionFeed"]>(
    () => {},
  ),
};

// Mock the db module
import { db } from "../../services/db";
Object.assign(db, drizzleMock);

export default drizzleMock;
