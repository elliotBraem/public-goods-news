export * from './twitter';
export * from './near';

export interface AppConfig {
  twitter: import('./twitter').TwitterConfig;
  near: import('./near').NearConfig;
  environment: 'development' | 'production' | 'test';
}
