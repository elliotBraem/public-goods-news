import { DistributorPlugin } from "../types";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export class RssPlugin implements DistributorPlugin {
  name = "rss";
  private title: string | null = null;
  private path: string | null = null;
  private maxItems: number = 100;
  private items: Array<{
    title: string;
    description: string;
    link: string;
    pubDate: string;
    guid: string;
  }> = [];

  async initialize(config: Record<string, string>): Promise<void> {
    if (!config.title || !config.path) {
      throw new Error("RSS plugin requires title and path");
    }

    this.title = config.title;
    this.path = config.path;
    if (config.maxItems) {
      this.maxItems = parseInt(config.maxItems);
    }

    try {
      // Load existing RSS items if file exists
      if (existsSync(this.path)) {
        const content = await readFile(this.path, "utf-8");
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
      console.info("RSS plugin initialized");
    } catch (error) {
      console.error("Failed to initialize RSS plugin:", error);
      throw error;
    }
  }

  async distribute(content: string): Promise<void> {
    if (!this.title || !this.path) {
      throw new Error("RSS plugin not initialized");
    }

    const item = {
      title: "New Update",
      description: content,
      link: "https://twitter.com/", // TODO: Update with actual link
      pubDate: new Date().toUTCString(),
      guid: Date.now().toString(),
    };

    this.items.unshift(item);
    this.items = this.items.slice(0, this.maxItems);

    await this.updateFeed();
  }

  private async updateFeed(): Promise<void> {
    if (!this.title || !this.path) return;

    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${this.title}</title>
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
    const dir = path.dirname(this.path);
    await mkdir(dir, { recursive: true });
    await writeFile(this.path, feed, "utf-8");
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
