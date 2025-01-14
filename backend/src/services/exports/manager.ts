import { AppConfig, PluginConfig, PluginsConfig } from "../../types/config";
import { Plugin, PluginModule } from "./types";
import { logger } from "../../utils/logger";

export class ExportManager {
  private plugins: Map<string, Plugin> = new Map();

  async initialize(config: PluginsConfig): Promise<void> {
    // Load all plugins
    for (const [name, pluginConfig] of Object.entries(config)) {
      try {
        await this.loadPlugin(name, pluginConfig);
      } catch (error) {
        logger.error(`Failed to load plugin ${name}:`, error);
      }
    }
  }

  private async loadPlugin(name: string, config: PluginConfig): Promise<void> {
    try {
      // Dynamic import of plugin from URL
      const module = await import(config.url) as PluginModule;
      const plugin = new module.default();
      
      // Store the plugin instance
      this.plugins.set(name, plugin);
      
      logger.info(`Successfully loaded plugin: ${name}`);
    } catch (error) {
      logger.error(`Error loading plugin ${name}:`, error);
      throw error;
    }
  }

  async transformContent(pluginName: string, content: string, config: { prompt: string }): Promise<string> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin || !('transform' in plugin)) {
      throw new Error(`Transformer plugin ${pluginName} not found or invalid`);
    }

    try {
      await plugin.initialize(config);
      return await plugin.transform(content);
    } catch (error) {
      logger.error(`Error transforming content with plugin ${pluginName}:`, error);
      throw error;
    }
  }

  async distributeContent(pluginName: string, content: string, config: Record<string, string>): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin || !('distribute' in plugin)) {
      throw new Error(`Distributor plugin ${pluginName} not found or invalid`);
    }

    try {
      await plugin.initialize(config);
      await plugin.distribute(content);
    } catch (error) {
      logger.error(`Error distributing content with plugin ${pluginName}:`, error);
      throw error;
    }
  }

  async processStreamOutput(feedId: string, content: string): Promise<void> {
    const config = await this.getConfig();
    const feed = config.feeds.find(f => f.id === feedId);
    if (!feed?.outputs.stream?.enabled) {
      return;
    }

    const { transform, distribute } = feed.outputs.stream;

    // Transform content if configured
    let processedContent = content;
    if (transform) {
      processedContent = await this.transformContent(
        transform.plugin,
        content,
        transform.config
      );
    }

    // Distribute to all configured outputs
    for (const dist of distribute) {
      await this.distributeContent(
        dist.plugin,
        processedContent,
        dist.config
      );
    }
  }

  async processRecapOutput(feedId: string, content: string): Promise<void> {
    const config = await this.getConfig();
    const feed = config.feeds.find(f => f.id === feedId);
    if (!feed?.outputs.recap?.enabled) {
      return;
    }

    const { transform, distribute } = feed.outputs.recap;

    // Transform content if configured
    let processedContent = content;
    if (transform) {
      processedContent = await this.transformContent(
        transform.plugin,
        content,
        transform.config
      );
    }

    // Distribute to all configured outputs
    for (const dist of distribute) {
      await this.distributeContent(
        dist.plugin,
        processedContent,
        dist.config
      );
    }
  }

  private async getConfig(): Promise<AppConfig> {
    const { ConfigService } = await import('../../services/config');
    return ConfigService.getInstance().getConfig();
  }

  async shutdown(): Promise<void> {
    // Shutdown all plugins
    for (const [name, plugin] of this.plugins.entries()) {
      try {
        if (plugin.shutdown) {
          await plugin.shutdown();
        }
      } catch (error) {
        logger.error(`Error shutting down plugin ${name}:`, error);
      }
    }
    this.plugins.clear();
  }
}
