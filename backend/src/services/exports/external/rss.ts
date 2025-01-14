import { ExportService, RssConfig } from "../types";
import { TwitterSubmission } from "../../../types";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export class RssExportService implements ExportService {
  name = "rss";
  private config: RssConfig;
  private items: Array<{
    title: string;
    description: string;
    link: string;
    pubDate: string;
    guid: string;
  }> = [];

  constructor(config: RssConfig) {
    if (!config.enabled) {
      throw new Error("RSS export service is not enabled");
    }
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Load existing RSS items if file exists
      if (existsSync(this.config.feedPath)) {
        const content = await readFile(this.config.feedPath, "utf-8");
        const match = content.match(/<item>[\s\S]*?<\/item>/g);
        if (match) {
          this.items = match.map((item) => {
            const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
            const description =
              item.match(/<description>(.*?)<\/description>/)?.[1] || "";
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
            const guid = item.match(/<guid>(.*?)<\/guid>/)?.[1] || "";
            return { title, description, link, pubDate, guid };
          });
        }
      }
      console.info("RSS export service initialized");
    } catch (error) {
      console.error("Failed to initialize RSS export service:", error);
      throw error;
    }
  }

  async handleApprovedSubmission(submission: TwitterSubmission): Promise<void> {
    try {
      const item = {
        title: this.formatTitle(submission),
        description: submission.content,
        link: `https://twitter.com/user/status/${submission.tweetId}`,
        pubDate: new Date(submission.createdAt).toUTCString(),
        guid: submission.tweetId,
      };

      this.items.unshift(item);
      if (this.config.maxItems) {
        this.items = this.items.slice(0, this.config.maxItems);
      }

      await this.updateFeed();
      console.info(`Exported submission ${submission.tweetId} to RSS`);
    } catch (error) {
      console.error("Failed to export submission to RSS:", error);
      throw error;
    }
  }

  private formatTitle(submission: TwitterSubmission): string {
    const categories = submission.categories?.length
      ? ` [${submission.categories.join(", ")}]`
      : "";
    return `New Public Good by @${submission.username}${categories}`;
  }

  private async updateFeed(): Promise<void> {
    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${this.config.title}</title>
    <description>${this.config.description}</description>
    <link>https://twitter.com/</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${this.items
      .map(
        (item) => `
    <item>
      <title>${this.escapeXml(item.title)}</title>
      <description>${this.escapeXml(item.description)}</description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
      <guid>${item.guid}</guid>
    </item>`,
      )
      .join("\n")}
  </channel>
</rss>`;

    // Ensure directory exists
    const dir = path.dirname(this.config.feedPath);
    await mkdir(dir, { recursive: true });
    await writeFile(this.config.feedPath, feed, "utf-8");
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
