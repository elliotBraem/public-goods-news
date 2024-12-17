import { Scraper, SearchMode, Tweet } from "agent-twitter-client";
import { TwitterSubmission, Moderation, TwitterConfig } from "../../types/twitter";
import { ADMIN_ACCOUNTS } from "../../config/admins";
import { logger } from "../../utils/logger";
import { db } from "../db";
import { 
  TwitterCookie,
  ensureCacheDirectory,
  getCachedCookies,
  cacheCookies,
} from "../../utils/cache";

export class TwitterService {
  private client: Scraper;
  private readonly DAILY_SUBMISSION_LIMIT = 10;
  private twitterUsername: string;
  private config: TwitterConfig;
  private isInitialized = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastCheckedTweetId: string | null = null;
  private adminIdCache: Map<string, string> = new Map();

  constructor(config: TwitterConfig) {
    this.client = new Scraper();
    this.twitterUsername = config.username;
    this.config = config;
  }

  private async setCookiesFromArray(cookiesArray: TwitterCookie[]) {
    const cookieStrings = cookiesArray.map(
      (cookie) =>
        `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${cookie.secure ? "Secure" : ""
        }; ${cookie.httpOnly ? "HttpOnly" : ""}; SameSite=${cookie.sameSite || "Lax"
        }`
    );
    await this.client.setCookies(cookieStrings);
  }

  private async initializeAdminIds() {
    for (const handle of ADMIN_ACCOUNTS) {
      try {
        const userId = await this.client.getUserIdByScreenName(handle);
        this.adminIdCache.set(handle, userId);
        logger.info(`Cached admin ID for @${handle}: ${userId}`);
      } catch (error) {
        logger.error(`Failed to fetch ID for admin handle @${handle}:`, error);
      }
    }
  }

  private isAdmin(userId: string): boolean {
    return Array.from(this.adminIdCache.values()).includes(userId);
  }

  async initialize() {
    try {
      // Ensure cache directory exists
      await ensureCacheDirectory();

      // Check for cached cookies
      const cachedCookies = await getCachedCookies(this.twitterUsername);
      if (cachedCookies) {
        await this.setCookiesFromArray(cachedCookies);
      }

      // Load last checked tweet ID from database
      this.lastCheckedTweetId = db.getLastCheckedTweetId();

      // Try to login with retries
      logger.info('Attempting Twitter login...');
      while (true) {
        try {
          await this.client.login(
            this.config.username,
            this.config.password,
            this.config.email,
          );

          if (await this.client.isLoggedIn()) {
            // Cache the new cookies
            const cookies = await this.client.getCookies();
            await cacheCookies(this.config.username, cookies);
            break;
          }
        } catch (error) {
          logger.error('Failed to login to Twitter, retrying...', error);
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Initialize admin IDs after successful login (convert from handle to account id)
      await this.initializeAdminIds();

      this.isInitialized = true;
      logger.info('Successfully logged in to Twitter');
    } catch (error) {
      logger.error('Failed to initialize Twitter client:', error);
      throw error;
    }
  }

  private async fetchAllNewMentions(): Promise<Tweet[]> {
    const BATCH_SIZE = 20;
    let allNewTweets: Tweet[] = [];
    let foundOldTweet = false;
    let maxAttempts = 10; // Safety limit to prevent infinite loops
    let attempts = 0;

    while (!foundOldTweet && attempts < maxAttempts) {
      try {
        const batch = (
          await this.client.fetchSearchTweets(
            `@${this.twitterUsername}`,
            BATCH_SIZE,
            SearchMode.Latest,
            allNewTweets.length > 0 ? allNewTweets[allNewTweets.length - 1].id : undefined
          )
        ).tweets;

        if (batch.length === 0) break; // No more tweets to fetch

        // Check if any tweet in this batch is older than or equal to our last checked ID
        for (const tweet of batch) {
          if (!tweet.id) continue;
          
          if (!this.lastCheckedTweetId || BigInt(tweet.id) > BigInt(this.lastCheckedTweetId)) {
            allNewTweets.push(tweet);
          } else {
            foundOldTweet = true;
            break;
          }
        }

        if (batch.length < BATCH_SIZE) break; // Last batch was partial, no more to fetch
        attempts++;
      } catch (error) {
        logger.error('Error fetching mentions batch:', error);
        break;
      }
    }

    // Sort all fetched tweets by ID (chronologically)
    return allNewTweets.sort((a, b) => {
      const aId = BigInt(a.id || '0');
      const bId = BigInt(b.id || '0');
      return aId > bId ? 1 : aId < bId ? -1 : 0;
    });
  }

  async startMentionsCheck() {
    logger.info('Listening for mentions...');
    
    // Check mentions every minute
    this.checkInterval = setInterval(async () => {
      if (!this.isInitialized) return;

      try {
        logger.info('Checking mentions...');
        
        const newTweets = await this.fetchAllNewMentions();

        if (newTweets.length === 0) {
          logger.info('No new mentions');
        } else {
          logger.info(`Found ${newTweets.length} new mentions`);

          // Process new tweets
          for (const tweet of newTweets) {
            if (!tweet.id) continue;
            
            try {
              if (this.isSubmission(tweet)) {
                logger.info("Received new submission.");
                await this.handleSubmission(tweet);
              } else if (this.isModeration(tweet)) {
                logger.info("Received new moderation.");
                await this.handleModeration(tweet);
              }
            } catch (error) {
              logger.error('Error processing tweet:', error);
            }
          }

          // Update the last checked tweet ID to the most recent one
          const latestTweetId = newTweets[newTweets.length - 1].id;
          if (latestTweetId) {
            db.saveLastCheckedTweetId(latestTweetId);
            this.lastCheckedTweetId = latestTweetId;
          }
        }
      } catch (error) {
        logger.error('Error checking mentions:', error);
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

    // Get submission count from database instead of memory
    const dailyCount = db.getDailySubmissionCount(userId);

    if (dailyCount >= this.DAILY_SUBMISSION_LIMIT) {
      await this.replyToTweet(
        tweet.id,
        "You've reached your daily submission limit. Please try again tomorrow."
      );
      logger.info(`User ${userId} has reached limit, replied to submission.`);
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

    // Save submission to database
    db.saveSubmission(submission);
    // Increment submission count in database
    db.incrementDailySubmissionCount(userId);

    await this.replyToTweet(
      tweet.id,
      "Successfully submitted to publicgoods.news!"
    );
    logger.info(`Successfully submitted. Replied to User: ${userId}.`)
  }

  private async handleModeration(tweet: Tweet): Promise<void> {
    const userId = tweet.userId;
    if (!userId || !tweet.id) return;

    logger.info(`Handling moderation for ${JSON.stringify(tweet)}`);

    // Verify admin status using cached ID
    if (!this.isAdmin(userId)) {
      logger.info(`User ${userId} is not admin.`)
      return; // Silently ignore non-admin moderation attempts
    }

    // Get the original submission tweet this is in response to
    const inReplyToId = tweet.inReplyToStatusId;
    logger.info(`It was a reply to ${tweet.inReplyToStatusId}`);
    if (!inReplyToId) return;

    // Get submission from database
    const submission = db.getSubmission(inReplyToId);
    logger.info(`Got the original submission: ${JSON.stringify(submission)}`);
    if (!submission) return;

    const action = this.getModerationAction(tweet);
    logger.info(`Determined the action: ${action}`);
    if (!action) return;

    // Check if this admin has already moderated this submission
    const hasModerated = submission.moderationHistory.some(
      (mod) => mod.adminId === userId
    );
    if (hasModerated) return;

    // Add moderation to database
    const moderation: Moderation = {
      adminId: userId,
      action: action,
      timestamp: tweet.timeParsed || new Date(),
      tweetId: tweet.id,
    };
    db.saveModerationAction(moderation);

    // Process the moderation action
    if (action === "approve") {
      logger.info(`Received review from User ${userId}, processing approval.`)
      await this.processApproval(submission);
    } else {
      logger.info(`Received review from User ${userId}, processing rejection.`)
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
      logger.error('Error replying to tweet:', error);
      throw error;
    }
  }
}
