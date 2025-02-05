export class MockDistributionService {
  public processedSubmissions: Array<{
    feedId: string;
    submissionId: string;
  }> = [];

  async processStreamOutput(
    feedId: string,
    submission: any,
  ): Promise<void> {
    this.processedSubmissions.push({ feedId, submissionId: submission.tweetId });
  }

  async processRecapOutput(): Promise<void> {
    // Not needed for current tests
  }
}
