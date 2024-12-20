import { Tweet } from "agent-twitter-client";

export class MockScraper {
  private mockTweets: Tweet[] = [];
  private _isLoggedIn = false;
  private cookies: string[] = [];

  // Method to add mock tweets for testing
  public addMockTweet(tweet: Tweet) {
    this.mockTweets.push(tweet);
  }

  // Method to clear mock tweets
  public clearMockTweets() {
    this.mockTweets = [];
  }

  async login(
    username: string,
    password: string,
    email: string,
  ): Promise<void> {
    this._isLoggedIn = true;
  }

  async logout(): Promise<void> {
    this._isLoggedIn = false;
  }

  async isLoggedIn(): Promise<boolean> {
    return this._isLoggedIn;
  }

  async setCookies(cookies: string[]): Promise<void> {
    this.cookies = cookies;
  }

  async getCookies(): Promise<string[]> {
    return this.cookies;
  }

  async getUserIdByScreenName(screenName: string): Promise<string> {
    return `mock-user-id-${screenName}`;
  }

  async fetchSearchTweets(
    query: string,
    count: number,
    mode: any,
    cursor?: string,
  ): Promise<{ tweets: Tweet[] }> {
    // If cursor is provided, simulate pagination by returning tweets after that ID
    if (cursor) {
      const cursorIndex = this.mockTweets.findIndex((t) => t.id === cursor);
      if (cursorIndex !== -1) {
        return {
          tweets: this.mockTweets.slice(
            cursorIndex + 1,
            cursorIndex + 1 + count,
          ),
        };
      }
    }

    return {
      tweets: this.mockTweets.slice(0, count),
    };
  }

  async getTweet(tweetId: string): Promise<Tweet | null> {
    return this.mockTweets.find((t) => t.id === tweetId) || null;
  }

  async sendTweet(message: string, replyToId?: string): Promise<Response> {
    const mockResponse = {
      json: async () => ({
        data: {
          create_tweet: {
            tweet_results: {
              result: {
                rest_id: `mock-reply-${Date.now()}`,
              },
            },
          },
        },
      }),
    };
    return mockResponse as Response;
  }
}
