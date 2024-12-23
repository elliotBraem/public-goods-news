import { connect, keyStores, Near, Account, Contract, KeyPair } from "near-api-js";
import { ExportService, NearConfig } from "../types";
import { TwitterSubmission } from "../../../types";
import { KeyPairString } from "near-api-js/lib/utils";

interface NearContract extends Contract {
  add_submission: (args: {
    tweet_id: string;
    user_id: string;
    username: string;
    content: string;
    description?: string;
    categories?: string[];
    created_at: string;
    submitted_at: string;
  }) => Promise<void>;
}

class NearExportService implements ExportService {
  name = "near";
  private near!: Near;
  private account!: Account;
  private contract!: NearContract;

  constructor(private config: NearConfig) {
    if (!config.enabled) {
      throw new Error("NEAR export service is not enabled");
    }
  }
  async initialize(): Promise<void> {
    try {
      // Initialize connection to NEAR
      const keyStore = new keyStores.InMemoryKeyStore();
      const keyPair = KeyPair.fromString(this.config.privateKey as KeyPairString);
      await keyStore.setKey(this.config.networkId, this.config.accountId, keyPair);

      this.near = await connect({
        networkId: this.config.networkId,
        nodeUrl: this.config.nodeUrl,
        keyStore,
        headers: {}
      });

      // Get account and contract
      this.account = await this.near.account(this.config.accountId);
      this.contract = new Contract(
        this.account,
        this.config.contractId,
        {
          viewMethods: [],
          changeMethods: ["add_submission"],
          useLocalViewExecution: false
        }
      ) as unknown as NearContract;

      console.info("NEAR export service initialized");
    } catch (error: unknown) {
      console.error("Failed to initialize NEAR export service:", error);
      throw error;
    }
  }

  async handleApprovedSubmission(submission: TwitterSubmission): Promise<void> {
    try {
      await this.contract.add_submission({
        tweet_id: submission.tweetId,
        user_id: submission.userId,
        username: submission.username,
        content: submission.content,
        description: submission.description,
        categories: submission.categories,
        created_at: submission.createdAt,
        submitted_at: submission.submittedAt
      });
      console.info(`Exported submission ${submission.tweetId} to NEAR contract`);
    } catch (error: unknown) {
      console.error("Failed to export submission to NEAR contract:", error);
      throw error;
    }
  }
}

export default NearExportService;