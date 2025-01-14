export interface DistributorPlugin {
  name: string;
  initialize(config: Record<string, string>): Promise<void>;
  distribute(content: string): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface TransformerPlugin {
  name: string;
  initialize(config: Record<string, string>): Promise<void>;
  transform(content: string): Promise<string>;
  shutdown?(): Promise<void>;
}

export type Plugin = DistributorPlugin | TransformerPlugin;

export interface PluginModule {
  default: new () => Plugin;
}
