export interface TwitterSubmission {
  tweetId: string;
  userId: string;
  username: string;
  content: string;
  hashtags: Array<string>;
  category?: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  moderationHistory: Moderation[];
  acknowledgmentTweetId?: string;
  moderationResponseTweetId?: string;
  createdAt: string;
}

export interface Moderation {
  adminId: string;
  action: "approve" | "reject";
  timestamp: Date;
  tweetId: string;
}

export interface TwitterConfig {
  username: string;
  password: string;
  email: string;
}
