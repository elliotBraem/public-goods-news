import { useState } from "react";
import { useLiveUpdates } from "../contexts/LiveUpdateContext";

export default function Settings() {
  const { lastTweetId } = useLiveUpdates();
  const [newTweetId, setNewTweetId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/last-tweet-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweetId: newTweetId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update tweet ID");
      }

      setSuccess(true);
      setNewTweetId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tweet ID");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Last Checked Tweet ID</h2>
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Current ID:</p>
          <code className="bg-gray-100 p-2 rounded block">
            {lastTweetId || "Not set"}
          </code>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tweetId" className="block text-sm font-medium text-gray-700 mb-1">
              New Tweet ID
            </label>
            <input
              type="text"
              id="tweetId"
              value={newTweetId}
              onChange={(e) => setNewTweetId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter new tweet ID"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-600 text-sm">Successfully updated tweet ID!</div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Tweet ID
          </button>
        </form>
      </div>
    </div>
  );
}
