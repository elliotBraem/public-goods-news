export * from "./twitter";

export interface AppConfig {
  twitter: import("./twitter").TwitterConfig;
  environment: "development" | "production" | "test";
}
