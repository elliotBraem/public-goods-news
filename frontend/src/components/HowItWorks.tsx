import { useBotId } from "../lib/config";

export function HowItWorks() {
  const botId = useBotId();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">How It Works</h2>
      <div className="space-y-6">
        <div className="p-4 border-2 border-black rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-2">1. Curation</h3>
          <p className="text-gray-700">
            Mention @{botId} with your feed's hashtag to submit content. For
            example:
            <code className="block mt-2 p-2 bg-white border border-gray-200 rounded font-mono text-sm">
              !submit @{botId} #ethereum Great article about web3!
            </code>
          </p>
        </div>

        <div className="p-4 border-2 border-black rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-2">2. Moderation</h3>
          <p className="text-gray-700">
            Designated approvers review submissions and can approve or reject by
            replying:
            <code className="block mt-2 p-2 bg-white border border-gray-200 rounded font-mono text-sm">
              !approve
            </code>
            <code className="block mt-2 p-2 bg-white border border-gray-200 rounded font-mono text-sm">
              !reject
            </code>
          </p>
        </div>

        <div className="p-4 border-2 border-black rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-2">3. Distribution</h3>
          <p className="text-gray-700">
            Approved content is automatically distributed across configured
            platforms and formats.
          </p>
        </div>
      </div>
    </div>
  );
}
