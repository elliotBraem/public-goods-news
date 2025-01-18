export class MockDistributionService {
  public processedSubmissions: Array<{
    feedId: string;
    submissionId: string;
  }> = [];

  async processStreamOutput(
    feedId: string,
    submissionId: string,
  ): Promise<void> {
    this.processedSubmissions.push({ feedId, submissionId });
  }
  
  async processRecapOutput(): Promise<void> {
    // Not needed for current tests
  }
}
