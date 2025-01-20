import { SearchMode, Tweet } from "agent-twitter-client";

export class MockTwitterService {
  private mockTweets: Tweet[] = [];
  private mockUserIds: Map<string, string> = new Map();

  public addMockTweet(tweet: Tweet) {
    this.mockTweets.push(tweet);
  }

  public addMockUserId(username: string, userId: string) {
    this.mockUserIds.set(username, userId);
  }

  public clearMockTweets() {
    this.mockTweets = [];
  }

  async initialize(): Promise<void> {
    // No-op for mock
  }

  async stop(): Promise<void> {
    // No-op for mock
  }

  async getUserIdByScreenName(screenName: string): Promise<string> {
    return this.mockUserIds.get(screenName) || `mock-user-id-${screenName}`;
  }

  async fetchAllNewMentions(): Promise<Tweet[]> {
    return this.mockTweets;
  }

  async getTweet(tweetId: string): Promise<Tweet | null> {
    return this.mockTweets.find((t) => t.id === tweetId) || null;
  }

  async replyToTweet(tweetId: string, message: string): Promise<string | null> {
    return `mock-reply-${Date.now()}`;
  }
}
