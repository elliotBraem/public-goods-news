import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import {
  RssItem,
  saveRssItem,
  getRssItems,
  deleteOldRssItems,
} from "../rss/queries";

// These are made available for plugins
export class DBOperations {
  constructor(private db: BunSQLiteDatabase) {}

  // RSS Operations
  saveRssItem(feedId: string, item: RssItem): void {
    saveRssItem(this.db, feedId, item);
  }

  getRssItems(feedId: string, limit: number): RssItem[] {
    return getRssItems(this.db, feedId, limit);
  }

  deleteOldRssItems(feedId: string, limit: number): void {
    deleteOldRssItems(this.db, feedId, limit);
  }
}
