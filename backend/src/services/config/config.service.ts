import fs from "fs/promises";
import path from "path";
import { AppConfig } from "../../types/config";
import { hydrateConfigValues } from "../../utils/config";

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig | null = null;
  private configPath: string;

  private constructor() {
    // Always look for config relative to the distribution directory
    this.configPath = path.resolve(__dirname, "../../../../curate.config.json");
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public async loadConfig(): Promise<AppConfig> {
    try {
      const rawConfig = await this.getRawConfig();
      const hydratedConfig = hydrateConfigValues(rawConfig);
      this.config = hydratedConfig;
      return hydratedConfig;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load config: ${message}`);
    }
  }

  public getConfig(): AppConfig {
    if (!this.config) {
      throw new Error("Config not loaded. Call loadConfig() first.");
    }
    return this.config;
  }

  public setConfigPath(path: string): void {
    this.configPath = path;
  }

  public async getRawConfig(): Promise<AppConfig> {
    try {
      const configFile = await fs.readFile(this.configPath, "utf-8");
      return JSON.parse(configFile) as AppConfig;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load raw config: ${message}`);
    }
  }

  // Switch to a different config (if saving locally, wouldn't work in fly.io container)
  public async updateConfig(newConfig: AppConfig): Promise<void> {
    // saving this for later
    try {
      await fs.writeFile(this.configPath, JSON.stringify(newConfig, null, 2));
      this.config = newConfig;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update config: ${message}`);
    }
  }
}
