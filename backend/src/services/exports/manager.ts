import { ExportService, ExportConfig } from "./types";
import { TwitterSubmission } from "../../types";
import { logger } from "../../utils/logger";

export class ExportManager {
  private services: ExportService[] = [];

  async initialize(configs: ExportConfig[]): Promise<void> {
    for (const config of configs) {
      if (!config.enabled) continue;

      try {
        // Simple relative import - works in both dev and prod since directory structure is preserved
        const module = await import(`./external/${config.module}`);
        const ServiceClass = module.default || Object.values(module)[0];
        const service = new ServiceClass(config);
        await service.initialize();
        this.services.push(service);
        logger.info(`Initialized ${service.name} export service`);
      } catch (error) {
        logger.error(
          `Failed to initialize ${config.type} export service:`,
          error,
        );
      }
    }
  }

  async handleApprovedSubmission(submission: TwitterSubmission): Promise<void> {
    const errors: Error[] = [];

    await Promise.all(
      this.services.map(async (service) => {
        try {
          await service.handleApprovedSubmission(submission);
        } catch (error) {
          errors.push(error as Error);
          logger.error(`Export error in ${service.name}:`, error);
        }
      }),
    );

    if (errors.length > 0) {
      throw new Error(
        `Export errors: ${errors.map((e) => e.message).join(", ")}`,
      );
    }
  }

  async shutdown(): Promise<void> {
    await Promise.all(
      this.services.map(async (service) => {
        try {
          await service.shutdown?.();
        } catch (error) {
          logger.error(
            `Error shutting down ${service.name} export service:`,
            error,
          );
        }
      }),
    );
  }
}
