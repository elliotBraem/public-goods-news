import {
  TwitterSubmission,
  SubmissionStatus,
} from "../../../backend/src/types/twitter";
export * from "../../../backend/src/types/twitter";

// Combine TwitterSubmission with feed-specific data
export interface TwitterSubmissionWithFeedData extends TwitterSubmission {
  status: SubmissionStatus;
  moderationResponseTweetId?: string;
}
