import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { Tweet } from "agent-twitter-client";
import { TwitterService } from "../services/twitter/client";
import { MockScraper } from "./mocks/twitter-client.mock";
import { TwitterConfig } from "../types/twitter";

import { TwitterSubmission } from "../types/twitter";

// Mock database functions
const mockDb = {
  getDailySubmissionCount: mock<(userId: string) => number>(() => 0),
  saveSubmission: mock<(submission: TwitterSubmission) => void>(() => {}),
  incrementDailySubmissionCount: mock<(userId: string) => void>(() => {}),
  updateSubmissionAcknowledgment: mock<
    (tweetId: string, acknowledgmentTweetId: string) => void
  >(() => {}),
  getSubmissionByAcknowledgmentTweetId: mock<
    (acknowledgmentTweetId: string) => TwitterSubmission | null
  >(() => null),
  saveModerationAction: mock<(moderation: any) => void>(() => {}),
  updateSubmissionStatus: mock<
    (
      tweetId: string,
      status: "approved" | "rejected",
      responseTweetId: string,
    ) => void
  >(() => {}),
};

// Mock cache functions
const mockCache = {
  ensureCacheDirectory: mock<() => Promise<void>>(async () => {}),
  getCachedCookies: mock<(username: string) => Promise<any>>(async () => null),
  cacheCookies: mock<(username: string, cookies: any) => Promise<void>>(
    async () => {},
  ),
  getLastCheckedTweetId: mock<() => Promise<string | null>>(async () => null),
  saveLastCheckedTweetId: mock<(tweetId: string) => Promise<void>>(
    async () => {},
  ),
};

// Override imports with mocks
import { db } from "../services/db";
import * as cache from "../utils/cache";
Object.assign(db, mockDb);
Object.assign(cache, mockCache);

describe("TwitterService", () => {
  let twitterService: TwitterService;
  let mockClient: MockScraper;

  const mockConfig: TwitterConfig = {
    username: "test_user",
    password: "test_pass",
    email: "test@example.com",
  };

  beforeEach(async () => {
    // Reset all mocks
    mockDb.getDailySubmissionCount.mockReset();
    mockDb.saveSubmission.mockReset();
    mockDb.incrementDailySubmissionCount.mockReset();
    mockDb.updateSubmissionAcknowledgment.mockReset();
    mockDb.getSubmissionByAcknowledgmentTweetId.mockReset();
    mockDb.saveModerationAction.mockReset();
    mockDb.updateSubmissionStatus.mockReset();

    mockCache.ensureCacheDirectory.mockReset();
    mockCache.getCachedCookies.mockReset();
    mockCache.cacheCookies.mockReset();
    mockCache.getLastCheckedTweetId.mockReset();
    mockCache.saveLastCheckedTweetId.mockReset();

    // Create new service instance
    twitterService = new TwitterService(mockConfig);
    // Get reference to the mock client
    mockClient = (twitterService as any).client;

    // Initialize the service
    await twitterService.initialize();
  });

  afterEach(async () => {
    if (twitterService) {
      await twitterService.stop();
    }
  });

  describe("Finding new tweets", () => {
    it("should find new mentions", async () => {
      // Add mock tweets
      const mockTweets: Tweet[] = [
        {
          id: "1",
          text: "Hey @test_user !submit",
          username: "user1",
          userId: "user1_id",
          inReplyToStatusId: "original1",
          timeParsed: new Date(),
          hashtags: [],
          mentions: [{ username: "test_user", id: "test_user_id" }],
          photos: [],
          thread: [],
          urls: [],
          videos: [],
        },
        {
          id: "2",
          text: "Another @test_user !submit",
          username: "user2",
          userId: "user2_id",
          inReplyToStatusId: "original2",
          timeParsed: new Date(),
          hashtags: [],
          mentions: [{ username: "test_user", id: "test_user_id" }],
          photos: [],
          thread: [],
          urls: [],
          videos: [],
        },
      ];

      // Add original tweets that are being submitted
      const originalTweets: Tweet[] = [
        {
          id: "original1",
          text: "Original tweet 1",
          username: "originalUser1",
          userId: "originalUser1_id",
          timeParsed: new Date(),
          hashtags: [],
          mentions: [] as { username: string; id: string }[],
          photos: [],
          thread: [],
          urls: [],
          videos: [],
        },
        {
          id: "original2",
          text: "Original tweet 2",
          username: "originalUser2",
          userId: "originalUser2_id",
          timeParsed: new Date(),
          hashtags: [],
          mentions: [] as { username: string; id: string }[],
          photos: [],
          thread: [],
          urls: [],
          videos: [],
        },
      ];

      // Add all tweets to mock client
      mockTweets.forEach((tweet) => mockClient.addMockTweet(tweet));
      originalTweets.forEach((tweet) => mockClient.addMockTweet(tweet));

      // Start checking mentions
      await twitterService.startMentionsCheck();

      // Wait for the first interval check
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify submissions were processed
      expect(mockDb.saveSubmission.mock.calls.length).toBe(2);
      expect(mockDb.incrementDailySubmissionCount.mock.calls.length).toBe(2);
    });

    it("should handle moderation tweets", async () => {
      // Add a mock moderation tweet
      const moderationTweet: Tweet = {
        id: "mod1",
        text: "@test_user moderating",
        username: "admin",
        userId: "mock-user-id-admin", // This matches our mock getUserIdByScreenName
        inReplyToStatusId: "ack1", // ID of our acknowledgment tweet
        timeParsed: new Date(),
        hashtags: ["approve"],
        mentions: [{ username: "test_user", id: "test_user_id" }],
        photos: [],
        thread: [],
        urls: [],
        videos: [],
      };

      mockClient.addMockTweet(moderationTweet);

      // Mock getting the submission
      mockDb.getSubmissionByAcknowledgmentTweetId.mockImplementation(() => ({
        tweetId: "original1",
        userId: "user1",
        username: "user1",
        content: "Original content",
        hashtags: [],
        status: "pending",
        moderationHistory: [],
        createdAt: new Date().toISOString(),
      }));

      // Start checking mentions
      await twitterService.startMentionsCheck();

      // Wait for the first interval check
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify moderation was processed
      expect(mockDb.saveModerationAction.mock.calls.length).toBeGreaterThan(0);
      expect(mockDb.updateSubmissionStatus.mock.calls.length).toBe(1);
      const calls = mockDb.updateSubmissionStatus.mock.calls;
      expect(calls[0][0]).toBe("original1");
      expect(calls[0][1]).toBe("approved");
      expect(typeof calls[0][2]).toBe("string");
    });

    it("should respect daily submission limits", async () => {
      // Mock that user has reached daily limit
      mockDb.getDailySubmissionCount.mockImplementation(() => 10);

      const mockTweet: Tweet = {
        id: "1",
        text: "Hey @test_user !submit",
        username: "user1",
        userId: "user1_id",
        inReplyToStatusId: "original1",
        timeParsed: new Date(),
        hashtags: [],
        mentions: [{ username: "test_user", id: "test_user_id" }],
        photos: [],
        thread: [],
        urls: [],
        videos: [],
      };

      mockClient.addMockTweet(mockTweet);

      // Start checking mentions
      await twitterService.startMentionsCheck();

      // Wait for the first interval check
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify submission was not saved
      expect(mockDb.saveSubmission.mock.calls.length).toBe(0);
      expect(mockDb.incrementDailySubmissionCount.mock.calls.length).toBe(0);
    });
  });
});
