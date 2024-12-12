import { AppConfig } from '../types';

const config: AppConfig = {
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
  },
  near: {
    networkId: process.env.NEAR_NETWORK_ID || 'testnet',
    nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
    walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.testnet.near.org',
    contractName: process.env.NEAR_CONTRACT_NAME || 'dev-1234567890-1234567890',
  },
  environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
};

export default config;
