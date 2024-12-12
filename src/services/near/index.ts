import { connect, keyStores, Near } from 'near-api-js';
import type { NearConfig } from '../../types';

export class NearService {
  private near: Near;

  constructor(config: NearConfig) {
    this.near = new Near({
      ...config,
      keyStore: new keyStores.InMemoryKeyStore(),
      headers: {},
    });
  }

  async getAccount(accountId: string) {
    try {
      const account = await this.near.account(accountId);
      return account;
    } catch (error) {
      console.error('Error getting NEAR account:', error);
      throw error;
    }
  }

  async viewMethod(contractId: string, method: string, args: object = {}) {
    try {
      const account = await this.near.account(contractId);
      const result = await account.viewFunction({
        contractId,
        methodName: method,
        args,
      });
      return result;
    } catch (error) {
      console.error('Error calling view method:', error);
      throw error;
    }
  }

  async callMethod(
    contractId: string,
    method: string,
    args: object = {},
    deposit: string = '0'
  ) {
    try {
      const account = await this.near.account(contractId);
      const result = await account.functionCall({
        contractId,
        methodName: method,
        args,
        attachedDeposit: deposit,
      });
      return result;
    } catch (error) {
      console.error('Error calling method:', error);
      throw error;
    }
  }
}
