export class MockDistributionService {
  public processedSubmissions: Array<{
    feedId: string;
    submissionId: string;
    content: string;
  }> = [];

  async processStreamOutput(
    feedId: string,
    submissionId: string,
    content: string
  ): Promise<void> {
    this.processedSubmissions.push({ feedId, submissionId, content });
  }

  async processRecapOutput(): Promise<void> {
    // Not needed for current tests
  }
}
