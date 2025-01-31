import { SearchMode, Tweet } from "agent-twitter-client";
import { TwitterService } from "../../services/twitter/client";
import { logger } from "../../utils/logger";

export class MockTwitterService extends TwitterService {
  private mockTweets: Tweet[] = [];
  private mockUserIds: Map<string, string> = new Map();
  private tweetIdCounter: bigint = BigInt(Date.now());

  constructor() {
    // Pass config with the bot's username so mentions are found
    super({
      username: "curatedotfun",
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
      fetchSearchTweets: async (query: string, count: number, mode: SearchMode) => {
        // Filter tweets that match the query (mentions @curatedotfun)
        const matchingTweets = this.mockTweets.filter(tweet => 
          tweet.text?.includes("@curatedotfun")
        );

        // Sort by ID descending (newest first) to match Twitter search behavior
        const sortedTweets = [...matchingTweets].sort((a, b) => {
          const aId = BigInt(a.id);
          const bId = BigInt(b.id);
          return bId > aId ? 1 : bId < aId ? -1 : 0;
        });

        return {
          tweets: sortedTweets.slice(0, count),
        };
      },
      likeTweet: async (tweetId: string) => {
        logger.info(`Mock: Liked tweet ${tweetId}`);
        return true;
      },
      sendTweet: async (message: string, replyToId?: string) => {
        const newTweet = this.addMockTweet({
          text: message,
          username: "curatedotfun",
          inReplyToStatusId: replyToId,
        });
        return {
          json: async () => ({
            data: {
              create_tweet: {
                tweet_results: {
                  result: {
                    rest_id: newTweet.id,
                  },
                },
              },
            },
          }),
        } as Response;
      },
    };
  }

  private getNextTweetId(): string {
    this.tweetIdCounter = this.tweetIdCounter + BigInt(1);
    return this.tweetIdCounter.toString();
  }

  public addMockTweet(tweet: Partial<Tweet> & { inReplyToStatusId?: string }) {
    const fullTweet: Tweet = {
      id: tweet.id || this.getNextTweetId(),
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
    // Let the parent TwitterService handle the processing logic
    return super.fetchAllNewMentions();
  }
  
  async getTweet(tweetId: string): Promise<Tweet | null> {
    return this.mockTweets.find((t) => t.id === tweetId) || null;
  }
}
