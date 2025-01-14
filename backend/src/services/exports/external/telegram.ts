import { ExportService, TelegramConfig } from "../types";
import { TwitterSubmission } from "../../../types";

export class TelegramExportService implements ExportService {
  name = "telegram";
  private botToken: string;
  private channelId: string;

  constructor(config: TelegramConfig) {
    if (!config.enabled) {
      throw new Error("Telegram export service is not enabled");
    }
    this.botToken = config.botToken;
    this.channelId = config.channelId;
  }

  async initialize(): Promise<void> {
    try {
      // Validate bot token and channel ID by making a test API call
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/getChat?chat_id=${this.channelId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to validate Telegram credentials");
      }
      console.info("Telegram export service initialized");
    } catch (error) {
      console.error("Failed to initialize Telegram export service:", error);
      throw error;
    }
  }

  async handleApprovedSubmission(submission: TwitterSubmission): Promise<void> {
    try {
      const message = this.formatSubmission(submission);
      await this.sendMessage(message);
      console.info(`Exported submission ${submission.tweetId} to Telegram`);
    } catch (error) {
      console.error("Failed to export submission to Telegram:", error);
      throw error;
    }
  }

  private formatSubmission(submission: TwitterSubmission): string {
    const categories = submission.categories?.length
      ? `\nCategories: ${submission.categories.join(", ")}`
      : "";

    return `🆕 New Curation\n\n${submission.content}${categories}\n\nBy @${
      submission.username
    }\nSource: https://twitter.com/user/status/${submission.tweetId}`;
  }

  private async sendMessage(text: string): Promise<void> {
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.channelId,
          text,
          parse_mode: "HTML",
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
    }
  }
}
