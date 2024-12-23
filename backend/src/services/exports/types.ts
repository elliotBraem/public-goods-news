import { TwitterSubmission } from "../../types";

export interface BaseExportConfig {
  enabled: boolean;
  type: string;
  module: string; // Module name (e.g., 'telegram', 'rss')
}

export interface TelegramConfig extends BaseExportConfig {
  type: 'telegram';
  botToken: string;
  channelId: string;
}

export interface RssConfig extends BaseExportConfig {
  type: 'rss';
  title: string;
  description: string;
  feedPath: string;
  maxItems?: number;
}

export interface NearConfig extends BaseExportConfig {
  type: 'near';
  networkId: string; // e.g., 'mainnet' or 'testnet'
  nodeUrl: string;
  contractId: string;
  accountId: string;
  privateKey: string;
}

export type ExportConfig = TelegramConfig | RssConfig | NearConfig;

export interface ExportService {
  name: string;
  initialize(): Promise<void>;
  handleApprovedSubmission(submission: TwitterSubmission): Promise<void>;
  shutdown?(): Promise<void>;
}
