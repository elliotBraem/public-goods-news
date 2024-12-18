import { logger } from "./logger";
import path from "path";
import fs from "fs/promises";

export interface TwitterCookie {
  key: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
}

interface CookieCache {
  [username: string]: TwitterCookie[];
}

const CACHE_DIR = process.env.CACHE_DIR || '.cache';

export async function ensureCacheDirectory() {
  try {
    try {
      await fs.access(CACHE_DIR);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(CACHE_DIR, { recursive: true });
      logger.info('Created cache directory');
    }
  } catch (error) {
    logger.error('Failed to create cache directory:', error);
    throw error;
  }
}

export async function getCachedCookies(username: string): Promise<TwitterCookie[] | null> {
  try {
    // Try to read cookies from a local cache file
    const cookiePath = path.join(CACHE_DIR, '.twitter-cookies.json');

    const data = await fs.readFile(cookiePath, 'utf-8');
    const cache: CookieCache = JSON.parse(data);

    if (cache[username]) {
      return cache[username];
    }
  } catch (error) {
    // If file doesn't exist or is invalid, return null
    return null;
  }
  return null;
}

export async function cacheCookies(username: string, cookies: TwitterCookie[]) {
  try {
    const cookiePath = path.join(CACHE_DIR, '.twitter-cookies.json');

    let cache: CookieCache = {};
    try {
      const data = await fs.readFile(cookiePath, 'utf-8');
      cache = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, start with empty cache
    }

    cache[username] = cookies;
    await fs.writeFile(cookiePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    logger.error('Failed to cache cookies:', error);
  }
}
