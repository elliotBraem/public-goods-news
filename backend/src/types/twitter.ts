export interface TwitterSubmission {
  tweetId: string;
  userId: string;
  username: string;
  content: string;
  description?: string;
  categories?: string[];
  status: "pending" | "approved" | "rejected";
  moderationHistory: Moderation[];
  acknowledgmentTweetId?: string;
  moderationResponseTweetId?: string;
  createdAt: string;
  submittedAt: string;
}

export interface Moderation {
  adminId: string;
  action: "approve" | "reject";
  timestamp: Date;
  tweetId: string;
  note?: string;
  categories?: string[];
}

export interface TwitterConfig {
  username: string;
  password: string;
  email: string;
}
