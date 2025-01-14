import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { Tweet } from "agent-twitter-client";
import { SubmissionService } from "../services/submissions/submission.service";
import { MockDistributionService } from "./mocks/distribution-service.mock";
import { MockTwitterService } from "./mocks/twitter-service.mock";
import drizzleMock from "./mocks/drizzle.mock";
import { AppConfig, PluginsConfig } from "../types/config";

describe("SubmissionService", () => {
  let submissionService: SubmissionService;
  let mockTwitterService: MockTwitterService;
  let mockDistributionService: MockDistributionService;
  
  const mockConfig: AppConfig = {
    global: {
      botId: "test_bot",
      maxSubmissionsPerUser: 5,
      defaultStatus: "pending"
    },
    feeds: [
      {
        id: "test",
        name: "Test Feed",
        description: "Test feed for unit tests",
        moderation: {
          approvers: {
            twitter: ["admin1"]
          }
        },
        outputs: {
          stream: {
            enabled: true,
            distribute: []
          }
        }
      },
      {
        id: "test2",
        name: "Test Feed 2",
        description: "Second test feed",
        moderation: {
          approvers: {
            twitter: ["admin1"]
          }
        },
        outputs: {
          stream: {
            enabled: true,
            distribute: []
          }
        }
      }
    ],
    plugins: {} as PluginsConfig
  };

  beforeEach(async () => {
    // Reset drizzle mock
    Object.values(drizzleMock).forEach(mockFn => mockFn.mockReset());
    
    // Create fresh instances
    mockTwitterService = new MockTwitterService();
    mockDistributionService = new MockDistributionService();
    submissionService = new SubmissionService(
      mockTwitterService as any,
      mockDistributionService as any,
      mockConfig
    );

    // Setup admin user ID
    mockTwitterService.addMockUserId("admin1", "admin1_id");

    // Initialize service
    await submissionService.initialize();
  });

  afterEach(async () => {
    await submissionService.stop();
  });

  describe("Submission Processing", () => {
    it("should process new submissions correctly", async () => {
      // Setup mock tweets
      const originalTweet: Tweet = {
        id: "original1",
        text: "Original content",
        username: "user1",
        userId: "user1_id",
        timeParsed: new Date(),
        hashtags: [],
        mentions: [],
        photos: [],
        urls: [],
        videos: [],
        thread: []
      };

      const submissionTweet: Tweet = {
        id: "submission1",
        text: "!submit #test",
        username: "user2",
        userId: "user2_id",
        inReplyToStatusId: "original1",
        timeParsed: new Date(),
        hashtags: ["test"],
        mentions: [],
        photos: [],
        urls: [],
        videos: [],
        thread: []
      };

      mockTwitterService.addMockTweet(originalTweet);
      mockTwitterService.addMockTweet(submissionTweet);

      // Trigger mentions check
      await submissionService.startMentionsCheck();

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify submission was saved
      expect(drizzleMock.saveSubmission).toHaveBeenCalledTimes(1);
      expect(drizzleMock.saveSubmissionToFeed).toHaveBeenCalledTimes(1);
      
      const savedSubmissionCall = drizzleMock.saveSubmission.mock.calls[0];
      expect(savedSubmissionCall[0].tweetId).toBe("original1");
      expect(savedSubmissionCall[0].status).toBe("pending");
    });

    it("should handle reprocessing without duplicate distributions", async () => {
      // Setup mock tweets
      const originalTweet: Tweet = {
        id: "original1",
        text: "Original content",
        username: "user1",
        userId: "user1_id",
        timeParsed: new Date(),
        hashtags: [],
        mentions: [],
        photos: [],
        urls: [],
        videos: [],
        thread: []
      };

      const submissionTweet: Tweet = {
        id: "submission1",
        text: "!submit #test",
        username: "user2",
        userId: "user2_id",
        inReplyToStatusId: "original1",
        timeParsed: new Date(),
        hashtags: ["test"],
        mentions: [],
        photos: [],
        urls: [],
        videos: [],
        thread: []
      };

      // First process the submission
      mockTwitterService.addMockTweet(originalTweet);
      mockTwitterService.addMockTweet(submissionTweet);
      await submissionService.startMentionsCheck();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear tweets and add moderation tweet
      mockTwitterService.clearMockTweets();
      const moderationTweet: Tweet = {
        id: "mod1",
        text: "#approve",
        username: "admin1",
        userId: "admin1_id",
        inReplyToStatusId: "reply-submission1", // Reply to the acknowledgment tweet
        timeParsed: new Date(),
        hashtags: ["approve"],
        mentions: [],
        photos: [],
        urls: [],
        videos: [],
        thread: []
      };

      // Setup mocks for moderation
      drizzleMock.getSubmissionByAcknowledgmentTweetId.mockResolvedValue({
        tweetId: "original1",
        userId: "user1_id",
        username: "user1",
        content: "Original content",
        status: "pending",
        moderationHistory: [],
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      });

      drizzleMock.getFeedsBySubmission.mockResolvedValue([
        { feedId: "test" }
      ]);

      // Process moderation
      mockTwitterService.addMockTweet(moderationTweet);
      await submissionService.startMentionsCheck();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify first distribution
      expect(mockDistributionService.processedSubmissions.length).toBe(1);
      expect(mockDistributionService.processedSubmissions[0].submissionId).toBe("original1");
      expect(mockDistributionService.processedSubmissions[0].feedId).toBe("test");

      // Now simulate moving back lastCheckedId and reprocessing
      mockTwitterService.clearMockTweets();
      await mockTwitterService.setLastCheckedTweetId(null);
      mockDistributionService.processedSubmissions = [];

      // Add all tweets back and reprocess
      mockTwitterService.addMockTweet(originalTweet);
      mockTwitterService.addMockTweet(submissionTweet);
      mockTwitterService.addMockTweet(moderationTweet);
      await submissionService.startMentionsCheck();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify no new distributions occurred
      expect(mockDistributionService.processedSubmissions.length).toBe(0);
    });

    it("should allow submissions to multiple feeds", async () => {
      // Setup mock tweets
      const originalTweet: Tweet = {
        id: "original1",
        text: "Original content",
        username: "user1",
        userId: "user1_id",
        timeParsed: new Date(),
        hashtags: [],
        mentions: [],
        photos: [],
        urls: [],
        videos: [],
        thread: []
      };

      const submissionTweet: Tweet = {
        id: "submission1",
        text: "!submit #test #test2",
        username: "user2",
        userId: "user2_id",
        inReplyToStatusId: "original1",
        timeParsed: new Date(),
        hashtags: ["test", "test2"],
        mentions: [],
        photos: [],
        urls: [],
        videos: [],
        thread: []
      };

      mockTwitterService.addMockTweet(originalTweet);
      mockTwitterService.addMockTweet(submissionTweet);

      // Process submission
      await submissionService.startMentionsCheck();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify submission was saved to both feeds
      expect(drizzleMock.saveSubmissionToFeed).toHaveBeenCalledTimes(2);
      const firstCall = drizzleMock.saveSubmissionToFeed.mock.calls[0];
      const secondCall = drizzleMock.saveSubmissionToFeed.mock.calls[1];
      expect(firstCall[1]).toBe("test");
      expect(secondCall[1]).toBe("test2");
    });
  });
});
