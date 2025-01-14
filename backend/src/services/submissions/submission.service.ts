import { DistributionService } from './../distribution/distribution.service';
import { Tweet } from "agent-twitter-client";
import { AppConfig } from "../../types/config";
import { TwitterService } from "../twitter/client";
import { db } from "../db";
import { logger } from "../../utils/logger";
import { Moderation, TwitterSubmission } from "../../types/twitter";
import { broadcastUpdate } from "../../index";

export class SubmissionService {
  private checkInterval: NodeJS.Timer | null = null;
  private lastCheckedTweetId: string | null = null;
  private adminIdCache: Map<string, string> = new Map();

  constructor(
    private readonly twitterService: TwitterService,
    private readonly DistributionService: DistributionService,
    private readonly config: AppConfig
  ) {}

  async initialize(): Promise<void> {
    // Initialize admin cache from config
    for (const feed of this.config.feeds) {
      for (const handle of feed.moderation.approvers.twitter) {
        try {
          const userId = await this.twitterService.getUserIdByScreenName(handle);
          this.adminIdCache.set(userId, handle);
          logger.info(`Cached admin ID for @${handle}: ${userId}`);
        } catch (error) {
          logger.error(`Failed to fetch ID for admin handle @${handle}:`, error);
        }
      }
    }

    // Load last checked tweet ID
    this.lastCheckedTweetId = await this.twitterService.getLastCheckedTweetId();
    broadcastUpdate({ type: "lastTweetId", data: this.lastCheckedTweetId });
  }

  async startMentionsCheck(): Promise<void> {
    logger.info("Starting submission monitoring...");

    // Check mentions every minute
    this.checkInterval = setInterval(async () => {
      try {
        logger.info("Checking mentions...");
        const newTweets = await this.twitterService.fetchAllNewMentions(this.lastCheckedTweetId);

        if (newTweets.length === 0) {
          logger.info("No new mentions");
        } else {
          logger.info(`Found ${newTweets.length} new mentions`);

          // Process new tweets
          for (const tweet of newTweets) {
            if (!tweet.id) continue;

            try {
              if (this.isSubmission(tweet)) {
                logger.info(`Received new submission: ${tweet.id}`);
                await this.handleSubmission(tweet);
              } else if (this.isModeration(tweet)) {
                logger.info(`Received new moderation: ${tweet.id}`);
                await this.handleModeration(tweet);
              }
            } catch (error) {
              logger.error("Error processing tweet:", error);
            }
          }

          // Update the last checked tweet ID
          const latestTweetId = newTweets[newTweets.length - 1].id;
          if (latestTweetId) {
            await this.setLastCheckedTweetId(latestTweetId);
          }
        }
      } catch (error) {
        logger.error("Error checking mentions:", error);
      }
    }, 60000); // Check every minute
  }

  async stop(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async handleSubmission(tweet: Tweet): Promise<void> {
    const userId = tweet.userId;
    if (!userId || !tweet.id) return;

    const inReplyToId = tweet.inReplyToStatusId;
    if (!inReplyToId) {
      logger.error(`Submission tweet ${tweet.id} is not a reply to another tweet`);
      return;
    }

    try {
      // Get daily submission count
      const dailyCount = db.getDailySubmissionCount(userId);
      const maxSubmissions = this.config.global.maxSubmissionsPerUser;

      if (dailyCount >= maxSubmissions) {
        await this.twitterService.replyToTweet(
          tweet.id,
          "You've reached your daily submission limit. Please try again tomorrow."
        );
        logger.info(`User ${userId} has reached limit, replied to submission.`);
        return;
      }

      // Fetch original tweet
      const originalTweet = await this.twitterService.getTweet(inReplyToId);
      if (!originalTweet) {
        logger.error(`Could not fetch original tweet ${inReplyToId}`);
        return;
      }

      // Create submission
      const submission: TwitterSubmission = {
        tweetId: originalTweet.id!,
        userId: originalTweet.userId!,
        username: originalTweet.username!,
        content: originalTweet.text || "",
        categories: tweet.hashtags || [],
        description: this.extractDescription(tweet),
        status: this.config.global.defaultStatus as "pending" | "approved" | "rejected",
        moderationHistory: [],
        createdAt: originalTweet.timeParsed?.toISOString() || new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };

      // Save submission
      db.saveSubmission(submission);
      db.incrementDailySubmissionCount(userId);

      // Send acknowledgment
      const acknowledgmentTweetId = await this.twitterService.replyToTweet(
        tweet.id,
        "Successfully submitted to publicgoods.news!"
      );

      if (acknowledgmentTweetId) {
        db.updateSubmissionAcknowledgment(originalTweet.id!, acknowledgmentTweetId);
        logger.info(`Successfully submitted. Sent reply: ${acknowledgmentTweetId}`);
      }
    } catch (error) {
      logger.error(`Error handling submission for tweet ${tweet.id}:`, error);
    }
  }

  private async handleModeration(tweet: Tweet): Promise<void> {
    const userId = tweet.userId;
    if (!userId || !tweet.id) return;

    if (!this.isAdmin(userId)) {
      logger.info(`User ${userId} is not admin.`);
      return;
    }

    const inReplyToId = tweet.inReplyToStatusId;
    if (!inReplyToId) return;

    const submission = db.getSubmissionByAcknowledgmentTweetId(inReplyToId);
    if (!submission || submission.status !== "pending") return;

    const action = this.getModerationAction(tweet);
    if (!action) return;

    const adminUsername = this.adminIdCache.get(userId);
    if (!adminUsername) {
      logger.error(`Could not find username for admin ID ${userId}`);
      return;
    }

    // Create moderation record
    const moderation: Moderation = {
      adminId: adminUsername,
      action,
      timestamp: tweet.timeParsed || new Date(),
      tweetId: submission.tweetId,
      categories: tweet.hashtags,
      note: this.extractNote(tweet),
    };

    db.saveModerationAction(moderation);

    // Process based on action
    if (action === "approve") {
      await this.processApproval(tweet, submission);
    } else {
      await this.processRejection(tweet, submission);
    }
  }

  private async processApproval(tweet: Tweet, submission: TwitterSubmission): Promise<void> {
    const responseTweetId = await this.twitterService.replyToTweet(
      tweet.id!,
      "Your submission has been approved and will be added to the public goods news feed!"
    );

    if (responseTweetId) {
      db.updateSubmissionStatus(submission.tweetId, "approved", responseTweetId);

      // Process through export manager
      try {
        const feed = this.config.feeds.find(f => 
          f.moderation.approvers.twitter.includes(this.adminIdCache.get(tweet.userId!) || '')
        );
        
        if (feed) {
          await this.DistributionService.processStreamOutput(feed.id, submission.content);
        }
      } catch (error) {
        logger.error("Failed to process approved submission:", error);
      }
    }
  }

  private async processRejection(tweet: Tweet, submission: TwitterSubmission): Promise<void> {
    const responseTweetId = await this.twitterService.replyToTweet(
      tweet.id!,
      "Your submission has been reviewed and was not accepted for the public goods news feed."
    );

    if (responseTweetId) {
      db.updateSubmissionStatus(submission.tweetId, "rejected", responseTweetId);
    }
  }

  private isAdmin(userId: string): boolean {
    return this.adminIdCache.has(userId);
  }

  private getModerationAction(tweet: Tweet): "approve" | "reject" | null {
    const hashtags = tweet.hashtags?.map(tag => tag.toLowerCase()) || [];
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

  private extractDescription(tweet: Tweet): string | undefined {
    return tweet.text
      ?.replace(/!submit\s+@\w+/i, "")
      .replace(/#\w+/g, "")
      .trim() || undefined;
  }

  private extractNote(tweet: Tweet): string | undefined {
    return tweet.text
      ?.replace(/#\w+/g, "")
      .trim() || undefined;
  }

  private async setLastCheckedTweetId(tweetId: string) {
    this.lastCheckedTweetId = tweetId;
    await this.twitterService.setLastCheckedTweetId(tweetId);
  }
}
