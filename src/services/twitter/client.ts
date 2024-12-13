import { TwitterApi } from "twitter-api-v2";
import { TwitterSubmission, Moderation, TwitterConfig } from "../../types/twitter";
import { ADMIN_ACCOUNTS } from "../../config/admins";
import config from "../../config/config";

interface TwitterHashtag {
  tag: string;
}

interface TweetData {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
  entities?: {
    hashtags?: TwitterHashtag[];
  };
  referenced_tweets?: Array<{
    id: string;
    type: string;
  }>;
}

export class TwitterService {
  private client: TwitterApi;
  private submissionCount: Map<string, number> = new Map();
  private submissions: Map<string, TwitterSubmission> = new Map(); // Key is original submission tweetId
  private readonly DAILY_SUBMISSION_LIMIT = 10;

  constructor(config: TwitterConfig) {
    // this.client = new TwitterApi(config.bearerToken);
    this.client = new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecret,
      // accessToken: config.accessToken,
      // accessSecret: config.accessTokenSecret
    });
  }

  async initialize() {
    // Login
    this.client = await this.client.appLogin();
    console.log("logged in to", await this.client.currentUser());

    // Set up tweet stream rules
    const rules = await this.client.v2.streamRules();
    if (rules.data?.length) {
      await this.client.v2.updateStreamRules({
        delete: { ids: rules.data.map((rule) => rule.id) },
      });
    }

    // Add new rules
    await this.client.v2.updateStreamRules({
      add: [
        { value: "!submit", tag: "submissions" },
        { value: "#approve", tag: "approvals" },
        { value: "#reject", tag: "rejections" },
      ],
    });
  }

  async startStream() {
    const stream = await this.client.v2.searchStream({
      "tweet.fields": [
        "author_id",
        "referenced_tweets",
        "entities",
        "created_at",
      ],
      "user.fields": ["username"],
    });

    stream.on("data", async (data: TweetData) => {
      try {
        if (this.isSubmission(data)) {
          await this.handleSubmission(data);
        } else if (this.isModeration(data)) {
          await this.handleModeration(data);
        }
      } catch (error) {
        console.error("Error processing tweet:", error);
      }
    });

    return stream;
  }

  private async handleSubmission(tweet: TweetData): Promise<void> {
    const userId = tweet.author_id;
    const dailyCount = this.submissionCount.get(userId) || 0;

    if (dailyCount >= this.DAILY_SUBMISSION_LIMIT) {
      await this.replyToTweet(
        tweet.id,
        "You've reached your daily submission limit. Please try again tomorrow.",
      );
      return;
    }

    const submission: TwitterSubmission = {
      tweetId: tweet.id,
      userId: userId,
      content: tweet.text,
      hashtags:
        tweet.entities?.hashtags?.map((h: TwitterHashtag) => h.tag) || [],
      status: "pending",
      moderationHistory: [],
    };

    this.submissions.set(tweet.id, submission);
    this.submissionCount.set(userId, dailyCount + 1);

    await this.replyToTweet(
      tweet.id,
      "Successfully submitted to publicgoods.news!",
    );
  }

  private async handleModeration(tweet: TweetData): Promise<void> {
    // Verify admin status
    if (!ADMIN_ACCOUNTS.includes(tweet.author_id)) {
      return; // Silently ignore non-admin moderation attempts
    }

    // Get the original submission tweet this is in response to
    const referencedTweet = tweet.referenced_tweets?.[0];
    if (!referencedTweet) return;

    const submission = this.submissions.get(referencedTweet.id);
    if (!submission) return;

    const action = this.getModerationAction(tweet);
    if (!action) return;

    // Check if this admin has already moderated this submission
    const hasModerated = submission.moderationHistory.some(
      (mod) => mod.adminId === tweet.author_id,
    );
    if (hasModerated) return;

    // Add to moderation history
    const moderation: Moderation = {
      adminId: tweet.author_id,
      action: action,
      timestamp: new Date(tweet.created_at),
      tweetId: tweet.id,
    };
    submission.moderationHistory.push(moderation);

    // Update submission status based on latest moderation
    submission.status = action === "approve" ? "approved" : "rejected";
    this.submissions.set(referencedTweet.id, submission);

    // Process the moderation action
    if (action === "approve") {
      await this.processApproval(submission);
    } else {
      await this.processRejection(submission);
    }
  }

  private async processApproval(submission: TwitterSubmission): Promise<void> {
    // TODO: Add NEAR integration here for approved submissions
    await this.replyToTweet(
      submission.tweetId,
      "Your submission has been approved and will be added to the public goods news feed!",
    );
  }

  private async processRejection(submission: TwitterSubmission): Promise<void> {
    await this.replyToTweet(
      submission.tweetId,
      "Your submission has been reviewed and was not accepted for the public goods news feed.",
    );
  }

  private getModerationAction(tweet: TweetData): "approve" | "reject" | null {
    const hashtags =
      tweet.entities?.hashtags?.map((h) => h.tag.toLowerCase()) || [];
    if (hashtags.includes("approve")) return "approve";
    if (hashtags.includes("reject")) return "reject";
    return null;
  }

  private isModeration(tweet: TweetData): boolean {
    return this.getModerationAction(tweet) !== null;
  }

  private isSubmission(tweet: TweetData): boolean {
    return tweet.text.toLowerCase().includes("!submit");
  }

  private async replyToTweet(tweetId: string, message: string): Promise<void> {
    await this.client.v2.reply(message, tweetId);
  }
}
