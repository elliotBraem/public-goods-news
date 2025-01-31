import { Elysia } from "elysia";
import { MockTwitterService } from "../__tests__/mocks/twitter-service.mock";
import { Tweet } from "agent-twitter-client";

// Create a single mock instance to maintain state
const mockTwitterService = new MockTwitterService();

// Helper to create a tweet object
const createTweet = (text: string, username: string): Tweet => ({
  id: Date.now().toString(),
  text,
  username,
  userId: `mock-user-id-${username}`,
  timeParsed: new Date(),
  hashtags: [],
  mentions: [],
  photos: [],
  urls: [],
  videos: [],
  thread: [],
});

export const testRoutes = new Elysia({ prefix: "/api/test" })
  .guard({
    beforeHandle: ({ request }) => {
      // Only allow in development and test environments
      if (process.env.NODE_ENV === "production") {
        return new Response("Not found", { status: 404 });
      }
    },
  })
  .get("/tweets", () => {
    return mockTwitterService.fetchAllNewMentions();
  })
  .post("/tweets", async ({ body }) => {
    const { text, username } = body as { text: string; username: string };
    const tweet = createTweet(text, username);
    mockTwitterService.addMockTweet(tweet);
    return tweet;
  })
  .post("/reset", () => {
    mockTwitterService.clearMockTweets();
    return { success: true };
  })
  .post("/scenario/approve", async ({ body }) => {
    const { projectId } = body as { projectId: string };
    const tweet = createTweet(`@curatedotfun approve ${projectId}`, "curator");
    mockTwitterService.addMockTweet(tweet);
    return { success: true, tweet };
  })
  .post("/scenario/reject", async ({ body }) => {
    const { projectId, reason } = body as { projectId: string; reason: string };
    const tweet = createTweet(`@curatedotfun reject ${projectId} ${reason}`, "curator");
    mockTwitterService.addMockTweet(tweet);
    return { success: true, tweet };
  });

// Export for use in tests and for replacing the real service
export { mockTwitterService };
