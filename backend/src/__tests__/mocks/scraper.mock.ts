import { Scraper, SearchMode, Tweet } from "agent-twitter-client";

export class MockScraper extends Scraper {
  private mockTweets: Tweet[] = [];
  private _isLoggedIn = true; // Always logged in for tests
  private cookies: any[] = [];

  constructor() {
    super();
  }

  public addMockTweet(tweet: Tweet) {
    this.mockTweets.push(tweet);
  }

  public clearMockTweets() {
    this.mockTweets = [];
  }

  async login(): Promise<void> {
    this._isLoggedIn = true;
    // Set default cookies on login
    this.cookies = [{
      key: "mock_cookie",
      value: "fresh_login",
      domain: ".twitter.com",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Lax"
    }];
  }

  async logout(): Promise<void> {
    this._isLoggedIn = false;
    this.cookies = [];
  }

  async isLoggedIn(): Promise<boolean> {
    return this._isLoggedIn;
  }

  async setCookies(cookieStrings: string[]): Promise<void> {
    // Parse cookie strings into cookie objects
    this.cookies = cookieStrings.map(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      return {
        key: name.trim(),
        value: value.trim(),
        domain: ".twitter.com",
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "Lax"
      };
    });
    this._isLoggedIn = true;
  }

  async getCookies(): Promise<any[]> {
    return this.cookies;
  }

  async clearCookies(): Promise<void> {
    this.cookies = [];
    this._isLoggedIn = false;
  }

  async getUserIdByScreenName(screenName: string): Promise<string> {
    return `mock-user-id-${screenName}`;
  }

  async fetchSearchTweets(
    query: string,
    count: number,
    mode: SearchMode,
    cursor?: string,
  ): Promise<{ tweets: Tweet[] }> {
    // Sort tweets by ID in descending order (newest first)
    const sortedTweets = [...this.mockTweets].sort((a, b) => {
      const aId = BigInt(a.id || "0");
      const bId = BigInt(b.id || "0");
      return bId > aId ? 1 : bId < aId ? -1 : 0;
    });

    // If cursor is provided, return tweets older than the cursor
    if (cursor) {
      const cursorIndex = sortedTweets.findIndex((t) => t.id === cursor);
      if (cursorIndex !== -1) {
        return {
          tweets: sortedTweets.slice(cursorIndex + 1, cursorIndex + 1 + count),
        };
      }
    }

    return {
      tweets: sortedTweets.slice(0, count),
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
