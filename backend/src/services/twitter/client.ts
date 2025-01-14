import { Scraper, SearchMode, Tweet } from "agent-twitter-client";
import { logger } from "../../utils/logger";
import {
  TwitterCookie,
  cacheCookies,
  ensureCacheDirectory,
  getCachedCookies,
  getLastCheckedTweetId,
  saveLastCheckedTweetId,
} from "../../utils/cache";

export class TwitterService {
  private client: Scraper;
  private lastCheckedTweetId: string | null = null;
  private twitterUsername: string;

  constructor(
    private readonly config: {
      username: string;
      password: string;
      email: string;
    },
  ) {
    this.client = new Scraper();
    this.twitterUsername = config.username;
  }

  private async setCookiesFromArray(cookiesArray: TwitterCookie[]) {
    const cookieStrings = cookiesArray.map(
      (cookie) =>
        `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${
          cookie.secure ? "Secure" : ""
        }; ${cookie.httpOnly ? "HttpOnly" : ""}; SameSite=${
          cookie.sameSite || "Lax"
        }`,
    );
    await this.client.setCookies(cookieStrings);
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

      // Load last checked tweet ID from cache
      this.lastCheckedTweetId = await getLastCheckedTweetId();

      // Try to login with retries
      logger.info("Attempting Twitter login...");
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
          logger.error("Failed to login to Twitter, retrying...", error);
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      logger.info("Successfully logged in to Twitter");
    } catch (error) {
      logger.error("Failed to initialize Twitter client:", error);
      throw error;
    }
  }

  async getUserIdByScreenName(screenName: string): Promise<string> {
    return await this.client.getUserIdByScreenName(screenName);
  }

  async getTweet(tweetId: string): Promise<Tweet | null> {
    return await this.client.getTweet(tweetId);
  }

  async replyToTweet(tweetId: string, message: string): Promise<string | null> {
    try {
      const response = await this.client.sendTweet(message, tweetId);
      const responseData = (await response.json()) as any;
      // Extract tweet ID from response
      const replyTweetId =
        responseData?.data?.create_tweet?.tweet_results?.result?.rest_id;
      return replyTweetId || null;
    } catch (error) {
      logger.error("Error replying to tweet:", error);
      return null;
    }
  }

  async fetchAllNewMentions(lastCheckedId: string | null): Promise<Tweet[]> {
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
            allNewTweets.length > 0
              ? allNewTweets[allNewTweets.length - 1].id
              : undefined,
          )
        ).tweets;

        if (batch.length === 0) break;

        for (const tweet of batch) {
          if (!tweet.id) continue;

          if (!lastCheckedId || BigInt(tweet.id) > BigInt(lastCheckedId)) {
            allNewTweets.push(tweet);
          } else {
            foundOldTweet = true;
            break;
          }
        }

        if (batch.length < BATCH_SIZE) break;
        attempts++;
      } catch (error) {
        logger.error("Error fetching mentions batch:", error);
        break;
      }
    }

    return allNewTweets.sort((a, b) => {
      const aId = BigInt(a.id || "0");
      const bId = BigInt(b.id || "0");
      return aId > bId ? 1 : aId < bId ? -1 : 0;
    });
  }

  async setLastCheckedTweetId(tweetId: string) {
    this.lastCheckedTweetId = tweetId;
    await saveLastCheckedTweetId(tweetId);
    logger.info(`Last checked tweet ID updated to: ${tweetId}`);
  }

  getLastCheckedTweetId(): string | null {
    return this.lastCheckedTweetId;
  }

  async stop() {
    await this.client.logout();
  }
}
