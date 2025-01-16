import { useState, useEffect } from "react";
import { useLiveUpdates } from "../contexts/LiveUpdateContext";

import type { AppConfig } from '../../../backend/src/types/config';

export default function Settings() {
  const { lastTweetId } = useLiveUpdates();
  const [newTweetId, setNewTweetId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Failed to load config:", err));
  }, []);

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
      setError(
        err instanceof Error ? err.message : "Failed to update tweet ID",
      );
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Global Plugins Section */}
      <div className="bg-white p-6 card-shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Global Plugins</h2>
        <div className="space-y-4">
          {config?.plugins && Object.entries(config.plugins).map(([name, plugin]) => (
            <div key={name} className="border-2 border-gray-800 p-4">
              <h3 className="font-mono text-lg mb-2">{name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Type:</div>
                <div>{plugin.type}</div>
                <div className="font-semibold">URL:</div>
                <div className="font-mono">{plugin.url}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feeds Section */}
      <div className="bg-white p-6 card-shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Feed Configurations</h2>
        <div className="space-y-6">
          {config?.feeds.map((feed) => (
            <div key={feed.id} className="border-2 border-gray-800 p-4">
              <h3 className="text-lg font-semibold mb-2">{feed.name}</h3>
              <p className="text-gray-600 mb-4">{feed.description}</p>
              
              {/* Approvers */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Approvers:</h4>
                <div className="flex flex-wrap gap-2">
                  {feed.moderation.approvers.twitter.map((handle) => (
                    <span key={handle} className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                      @{handle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stream Plugins */}
              {feed.outputs.stream.enabled && feed.outputs.stream.distribute && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Stream Plugins:</h4>
                  <div className="space-y-2">
                    {feed.outputs.stream.distribute.map((dist, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded">
                        <code className="font-mono text-sm">{dist.plugin}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recap Plugins */}
              {feed.outputs.recap?.enabled && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Recap Plugins:</h4>
                  <div className="space-y-2">
                    {feed.outputs.recap.transform && (
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium">Transform: </span>
                        <code className="font-mono text-sm">{feed.outputs.recap.transform.plugin}</code>
                      </div>
                    )}
                    {feed.outputs.recap.distribute?.map((dist, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium">Distribute: </span>
                        <code className="font-mono text-sm">{dist.plugin}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tweet ID Section */}
      <div className="bg-white p-6 card-shadow">
        <h2 className="text-lg font-semibold mb-4">Last Checked Tweet ID</h2>
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Current ID:</p>
          <code className="bg-gray-50 p-2 border-2 border-gray-800 block font-mono">
            {lastTweetId || "Not set"}
          </code>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="tweetId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Tweet ID
            </label>
            <input
              type="text"
              id="tweetId"
              value={newTweetId}
              onChange={(e) => setNewTweetId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-800 focus:outline-none transition-colors"
              placeholder="Enter new tweet ID"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          {success && (
            <div className="text-green-600 text-sm">
              Successfully updated tweet ID!
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border-2 border-gray-800 bg-gray-800 text-white font-medium hover:bg-gray-900 transition-colors"
          >
            Update Tweet ID
          </button>
        </form>
      </div>
    </div>
  );
}
