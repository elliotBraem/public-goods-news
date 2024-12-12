export interface NewsProposal {
  id: string;
  submitter: string;
  content: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  tweetId: string;
}

export interface NearConfig {
  networkId: string;
  nodeUrl: string;
  walletUrl: string;
  contractName: string;
}
