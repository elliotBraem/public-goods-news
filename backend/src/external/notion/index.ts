import { Client } from "@notionhq/client";
import { DistributorPlugin } from "types/plugin";
import { TwitterSubmission } from "types/twitter";

export default class NotionPlugin implements DistributorPlugin {
  name = "notion";
  private client: Client | null = null;
  private databaseId: string | null = null;

  async initialize(feedId: string, config: Record<string, string>): Promise<void> {
    // Validate required config
    if (!config.token) {
      throw new Error("Notion plugin requires token");
    }
    if (!config.databaseId) {
      throw new Error("Notion plugin requires databaseId");
    }

    this.client = new Client({ auth: config.token });
    this.databaseId = config.databaseId;

    try {
      // Validate credentials by attempting to query the database
      await this.client.databases.retrieve({
        database_id: this.databaseId,
      });
    } catch (error) {
      console.error("Failed to initialize Notion plugin:", error);
      throw new Error("Failed to validate Notion credentials");
    }
  }

  async distribute(feedId: string, submission: TwitterSubmission): Promise<void> {
    if (!this.client || !this.databaseId) {
      throw new Error("Notion plugin not initialized");
    }

    try {
      await this.createDatabaseRow(submission);
    } catch (error) {
      console.error("Failed to create Notion database row:", error);
      throw error;
    }
  }

  private async createDatabaseRow(submission: TwitterSubmission): Promise<void> {
    if (!this.client || !this.databaseId) {
      throw new Error("Notion plugin not initialized");
    }

    await this.client.pages.create({
      parent: {
        database_id: this.databaseId,
      },
      properties: {
        tweetId: {
          rich_text: [{ text: { content: submission.tweetId } }]
        },
        userId: {
          rich_text: [{ text: { content: submission.userId } }]
        },
        username: {
          rich_text: [{ text: { content: submission.username } }]
        },
        curatorId: {
          rich_text: [{ text: { content: submission.curatorId } }]
        },
        curatorUsername: {
          rich_text: [{ text: { content: submission.curatorUsername } }]
        },
        content: {
          rich_text: [{ text: { content: submission.content.slice(0, 2000) } }]
        },
        curatorNotes: {
          rich_text: submission.curatorNotes ? [{ text: { content: submission.curatorNotes } }] : []
        },
        curatorTweetId: {
          rich_text: [{ text: { content: submission.curatorTweetId } }]
        },
        createdAt: {
          rich_text: [{ text: { content: submission.createdAt } }]
        },
        submittedAt: {
          rich_text: [{ text: { content: submission.submittedAt || "" } }]
        },
        status: {
          rich_text: [{ text: { content: submission.status || "pending" } }]
        }
      }
    });
  }
}
