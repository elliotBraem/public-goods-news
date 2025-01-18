import { SubmissionStatus } from "../../types/twitter";

export interface DbSubmission {
  tweetId: string;
  userId: string;
  username: string;
  content: string;
  curatorNotes: string | null;
  curatorId: string;
  curatorUsername: string;
  curatorTweetId: string;
  createdAt: string;
  submittedAt: string | null;
}

export interface DbModeration {
  tweetId: string | null;
  feedId: string | null;
  adminId: string | null;
  action: string | null;
  note: string | null;
  createdAt: string | null;
}

export interface DbQueryResult {
  s: DbSubmission;
  m: DbModeration;
}

export interface DbFeedQueryResult extends DbQueryResult {
  sf: {
    status: SubmissionStatus;
  };
}
