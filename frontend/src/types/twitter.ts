export interface TwitterSubmission {
  tweetId: string;
  userId: string;
  content: string;
  hashtags: Array<string>;
  category?: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  moderationHistory: Moderation[];
  acknowledgmentTweetId?: string;
  moderationResponseTweetId?: string;
}

export interface Moderation {
  adminId: string;
  action: "approve" | "reject";
  timestamp: Date;
  tweetId: string;
}
