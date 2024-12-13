import { Scraper, SearchMode, Tweet } from "agent-twitter-client";
import { TwitterSubmission, Moderation, TwitterConfig } from "../../types/twitter";
import { ADMIN_ACCOUNTS } from "../../config/admins";

export class TwitterService {
  private client: Scraper;
  private submissionCount: Map<string, number> = new Map();
  private submissions: Map<string, TwitterSubmission> = new Map(); // Key is original submission tweetId
  private readonly DAILY_SUBMISSION_LIMIT = 10;
  private twitterUsername: string;
  private config: TwitterConfig;
  private isInitialized = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(config: TwitterConfig) {
    this.client = new Scraper();
    this.twitterUsername = config.username;
    this.config = config;
  }

  async initialize() {
    try {
      // Login using credentials
      await this.client.login(
        this.config.username,
        this.config.password,
        this.config.email,
        this.config.apiKey,
        this.config.apiSecret,
        this.config.accessToken,
        this.config.accessTokenSecret
      );

      this.isInitialized = true;
      console.log("Logged in to Twitter successfully");

      // Start checking for mentions periodically
      this.startMentionsCheck();
    } catch (error) {
      console.error("Failed to initialize Twitter client:", error);
      throw error;
    }
  }

  private async startMentionsCheck() {
    // Check mentions every minute
    this.checkInterval = setInterval(async () => {
      if (!this.isInitialized) return;
      
      try {
        // Check for mentions
        const mentionCandidates = (
          await this.client.fetchSearchTweets(
            `@${this.twitterUsername}`,
            20,
            SearchMode.Latest
          )
        ).tweets;

        // Process each mention
        for (const tweet of mentionCandidates) {
          try {
            if (this.isSubmission(tweet)) {
              await this.handleSubmission(tweet);
            } else if (this.isModeration(tweet)) {
              await this.handleModeration(tweet);
            }
          } catch (error) {
            console.error("Error processing tweet:", error);
          }
        }
      } catch (error) {
        console.error("Error checking mentions:", error);
      }
    }, 60000); // Check every minute
  }

  async stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    await this.client.logout();
    this.isInitialized = false;
  }

  private async handleSubmission(tweet: Tweet): Promise<void> {
    const userId = tweet.userId;
    if (!userId || !tweet.id) return;

    const dailyCount = this.submissionCount.get(userId) || 0;

    if (dailyCount >= this.DAILY_SUBMISSION_LIMIT) {
      await this.replyToTweet(
        tweet.id,
        "You've reached your daily submission limit. Please try again tomorrow."
      );
      return;
    }

    const submission: TwitterSubmission = {
      tweetId: tweet.id,
      userId: userId,
      content: tweet.text || "",
      hashtags: tweet.hashtags || [],
      status: "pending",
      moderationHistory: [],
    };

    this.submissions.set(tweet.id, submission);
    this.submissionCount.set(userId, dailyCount + 1);

    await this.replyToTweet(
      tweet.id,
      "Successfully submitted to publicgoods.news!"
    );
  }

  private async handleModeration(tweet: Tweet): Promise<void> {
    const userId = tweet.userId;
    if (!userId || !tweet.id) return;

    // Verify admin status
    if (!ADMIN_ACCOUNTS.includes(userId)) {
      return; // Silently ignore non-admin moderation attempts
    }

    // Get the original submission tweet this is in response to
    const inReplyToId = tweet.inReplyToStatusId;
    if (!inReplyToId) return;

    const submission = this.submissions.get(inReplyToId);
    if (!submission) return;

    const action = this.getModerationAction(tweet);
    if (!action) return;

    // Check if this admin has already moderated this submission
    const hasModerated = submission.moderationHistory.some(
      (mod) => mod.adminId === userId
    );
    if (hasModerated) return;

    // Add to moderation history
    const moderation: Moderation = {
      adminId: userId,
      action: action,
      timestamp: tweet.timeParsed || new Date(),
      tweetId: tweet.id,
    };
    submission.moderationHistory.push(moderation);

    // Update submission status based on latest moderation
    submission.status = action === "approve" ? "approved" : "rejected";
    this.submissions.set(inReplyToId, submission);

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
      "Your submission has been approved and will be added to the public goods news feed!"
    );
  }

  private async processRejection(submission: TwitterSubmission): Promise<void> {
    await this.replyToTweet(
      submission.tweetId,
      "Your submission has been reviewed and was not accepted for the public goods news feed."
    );
  }

  private getModerationAction(tweet: Tweet): "approve" | "reject" | null {
    const hashtags = tweet.hashtags.map(tag => tag.toLowerCase());
    if (hashtags.includes("approve")) return "approve";
    if (hashtags.includes("reject")) return "reject";
    return null;
  }

  private isModeration(tweet: Tweet): boolean {
    return this.getModerationAction(tweet) !== null;
  }

  private isSubmission(tweet: Tweet): boolean {
    return tweet.text?.toLowerCase().includes("!submit") || false;
  }

  private async replyToTweet(tweetId: string, message: string): Promise<void> {
    try {
      await this.client.sendTweet(message, tweetId); // Second parameter is the tweet to reply to
    } catch (error) {
      console.error("Error replying to tweet:", error);
      throw error;
    }
  }
}
