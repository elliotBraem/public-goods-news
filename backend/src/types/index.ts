export * from "./twitter";
export * from "../services/exports/types";

export interface AppConfig {
  twitter: import("./twitter").TwitterConfig;
  environment: "development" | "production" | "test";
  exports: import("../services/exports/types").ExportConfig[];
}
