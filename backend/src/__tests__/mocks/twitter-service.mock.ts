import { Tweet } from "agent-twitter-client";
import { TwitterService } from "../../services/twitter/client";
import { logger } from "../../utils/logger";

export class MockTwitterService extends TwitterService {
  private mockTweets: Tweet[] = [];
  private mockUserIds: Map<string, string> = new Map();
  private tweetIdCounter: bigint = BigInt(Date.now());

  constructor() {
    // Pass empty config since we're mocking
    super({
      username: "mock_user",
      password: "mock_pass",
      email: "mock@example.com",
    });
    // Override the client with a basic mock
    (this as any).client = {
      isLoggedIn: async () => true,
      login: async () => {},
      logout: async () => {},
      getCookies: async () => [],
      setCookies: async () => {},
    };
  }

  private getNextTweetId(): string {
    this.tweetIdCounter = this.tweetIdCounter + BigInt(1);
    return this.tweetIdCounter.toString();
  }

  public addMockTweet(tweet: Partial<Tweet> & { inReplyToStatusId?: string }) {
    const fullTweet: Tweet = {
      id: this.getNextTweetId(),
      text: tweet.text || "",
      username: tweet.username || "test_user",
      userId: tweet.userId || `mock-user-id-${tweet.username || "test_user"}`,
      timeParsed: tweet.timeParsed || new Date(),
      hashtags: tweet.hashtags || [],
      mentions: tweet.mentions || [],
      photos: tweet.photos || [],
      urls: tweet.urls || [],
      videos: tweet.videos || [],
      thread: [],
      inReplyToStatusId: tweet.inReplyToStatusId,
    };
    this.mockTweets.push(fullTweet);
    logger.info(`Mock: Added tweet "${fullTweet.text}" from @${fullTweet.username}${tweet.inReplyToStatusId ? ` as reply to ${tweet.inReplyToStatusId}` : ''}`);
    return fullTweet;
  }

  public addMockUserId(username: string, userId: string) {
    this.mockUserIds.set(username, userId);
  }

  public clearMockTweets() {
    this.mockTweets = [];
    logger.info("Mock: Cleared all tweets");
  }

  async initialize(): Promise<void> {
    logger.info("Mock Twitter service initialized");
  }

  async stop(): Promise<void> {
    logger.info("Mock Twitter service stopped");
  }

  async getUserIdByScreenName(screenName: string): Promise<string> {
    return this.mockUserIds.get(screenName) || `mock-user-id-${screenName}`;
  }

  async fetchAllNewMentions(): Promise<Tweet[]> {
    // Get the last tweet ID we processed
    const lastCheckedId = this.getLastCheckedTweetId();
    
    // If we have tweets and no last checked ID, set it to the newest tweet
    if (this.mockTweets.length > 0 && !lastCheckedId) {
      const newestTweet = this.mockTweets[this.mockTweets.length - 1];
      await this.setLastCheckedTweetId(newestTweet.id);
      return [newestTweet];
    }

    // Filter tweets newer than last checked ID
    const newTweets = this.mockTweets.filter(tweet => {
      if (!lastCheckedId) return true;
      return BigInt(tweet.id) > BigInt(lastCheckedId);
    });

    // Update last checked ID if we found new tweets
    if (newTweets.length > 0) {
      const newestTweet = newTweets[newTweets.length - 1];
      await this.setLastCheckedTweetId(newestTweet.id);
    }

    return newTweets;
  }

  async getTweet(tweetId: string): Promise<Tweet | null> {
    return this.mockTweets.find((t) => t.id === tweetId) || null;
  }

  async replyToTweet(tweetId: string, message: string): Promise<string | null> {
    const replyTweet = await this.addMockTweet({
      text: message,
      username: "curatedotfun",
      inReplyToStatusId: tweetId,
    });
    logger.info(`Mock: Replied to tweet ${tweetId} with "${message}"`);
    return replyTweet.id;
  }

  async likeTweet(tweetId: string): Promise<void> {
    logger.info(`Mock: Liked tweet ${tweetId}`);
  }

  // Helper methods for test scenarios
  async simulateSubmission(contentUrl: string) {
    // First create the content tweet
    const contentTweet = await this.addMockTweet({
      text: "Original content",
      username: "content_creator",
    });

    // Then create the curator's submission as a reply
    return this.addMockTweet({
      text: `@curatedotfun !submit ${contentUrl}`,
      username: "curator",
      userId: "mock-user-id-curator",
      timeParsed: new Date(),
      inReplyToStatusId: contentTweet.id,
    });
  }

  async simulateApprove(submissionTweetId: string, projectId: string) {
    return this.addMockTweet({
      text: `@curatedotfun !approve ${projectId}`,
      username: "moderator",
      userId: "mock-user-id-moderator",
      timeParsed: new Date(),
      inReplyToStatusId: submissionTweetId,
    });
  }

  async simulateReject(submissionTweetId: string, projectId: string, reason: string) {
    return this.addMockTweet({
      text: `@curatedotfun !reject ${projectId} ${reason}`,
      username: "moderator",
      userId: "mock-user-id-moderator",
      timeParsed: new Date(),
      inReplyToStatusId: submissionTweetId,
    });
  }
}
