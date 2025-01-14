import { Tweet } from "agent-twitter-client";

export class MockTwitterService {
  private lastCheckedId: string | null = null;
  private mockTweets: Tweet[] = [];
  private mockUserIds: Map<string, string> = new Map();

  async initialize(): Promise<void> {
    // Mock implementation - do nothing
  }

  async login(): Promise<void> {
    // Mock implementation - do nothing
  }

  async isLoggedIn(): Promise<boolean> {
    return true;
  }

  async getCookies(): Promise<any[]> {
    return [];
  }

  async setCookies(): Promise<void> {
    // Mock implementation - do nothing
  }

  async getUserIdByScreenName(handle: string): Promise<string> {
    return this.mockUserIds.get(handle) || "mock-user-id";
  }

  getLastCheckedTweetId(): string | null {
    return this.lastCheckedId;
  }

  async setLastCheckedTweetId(id: string | null): Promise<void> {
    this.lastCheckedId = id;
  }

  async replyToTweet(tweetId: string, message: string): Promise<string> {
    return `reply-${tweetId}`;
  }

  async getTweet(tweetId: string): Promise<Tweet | null> {
    return this.mockTweets.find(t => t.id === tweetId) || null;
  }

  async fetchAllNewMentions(lastCheckedId: string | null): Promise<Tweet[]> {
    if (!lastCheckedId) return this.mockTweets;
    const index = this.mockTweets.findIndex(t => t.id === lastCheckedId);
    if (index === -1) return this.mockTweets;
    return this.mockTweets.slice(index + 1);
  }

  addMockTweet(tweet: Tweet) {
    this.mockTweets.push(tweet);
  }

  addMockUserId(handle: string, id: string) {
    this.mockUserIds.set(handle, id);
  }

  clearMockTweets() {
    this.mockTweets = [];
  }
}
