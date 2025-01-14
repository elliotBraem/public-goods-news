export interface GlobalConfig {
  defaultStatus: string;
  maxSubmissionsPerUser: number;
}

export interface PluginConfig {
  type: 'distributor' | 'transformer';
  url: string;
}

export interface ModerationConfig {
  approvers: {
    twitter: string[];
  };
  templates: {
    approve: string;
    reject: string;
    acknowledge: string;
  };
}

export interface TransformConfig {
  plugin: string;
  config: {
    prompt: string;
  };
}

export interface DistributorConfig {
  plugin: string;
  config: Record<string, string>;
}

export interface OutputConfig {
  enabled: boolean;
  schedule?: string;
  transform?: TransformConfig;
  distribute: DistributorConfig[];
}

export type PluginsConfig = Record<string, PluginConfig>;

export interface FeedConfig {
  id: string;
  name: string;
  description: string;
  moderation: ModerationConfig;
  outputs: {
    stream?: OutputConfig;
    recap?: OutputConfig;
  };
}

export interface AppConfig {
  global: GlobalConfig;
  plugins: PluginsConfig;
  feeds: FeedConfig[];
}
