import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

interface Tweet {
  id: string;
  text: string;
  username: string;
  userId: string;
  timeParsed: Date;
  inReplyToStatusId?: string;
}

export const Route = createFileRoute("/test")({
  component: TestPage,
});

function TestPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [contentUrl, setContentUrl] = useState("https://example.com/content");
  const [selectedFeed, setSelectedFeed] = useState("test-feed");
  const [submissionTweetId, setSubmissionTweetId] = useState<string | null>(null);

  const fetchTweets = async () => {
    const response = await fetch("/api/test/tweets");
    const data = await response.json();
    setTweets(data);
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      fetchTweets();
    }
  }, []);

  const handleSubmit = async () => {
    await fetch("/api/test/tweets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Original content",
        username: "content_creator",
      }),
    });

    const submissionResponse = await fetch("/api/test/tweets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `@curatedotfun !submit ${contentUrl} #${selectedFeed}`,
        username: "curator",
        inReplyToStatusId: tweets[tweets.length - 1]?.id,
      }),
    });

    const submissionTweet = await submissionResponse.json();
    setSubmissionTweetId(submissionTweet.id);
    fetchTweets();
  };

  const handleApprove = async () => {
    if (!submissionTweetId) {
      alert("Please submit content first");
      return;
    }

    await fetch("/api/test/tweets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `@curatedotfun !approve ${selectedFeed}`,
        username: "moderator",
        inReplyToStatusId: submissionTweetId,
      }),
    });
    fetchTweets();
  };

  const handleReject = async () => {
    if (!submissionTweetId) {
      alert("Please submit content first");
      return;
    }

    await fetch("/api/test/tweets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `@curatedotfun !reject ${selectedFeed} spam`,
        username: "moderator",
        inReplyToStatusId: submissionTweetId,
      }),
    });
    fetchTweets();
  };

  const handleReset = async () => {
    await fetch("/api/test/reset", { method: "POST" });
    setSubmissionTweetId(null);
    fetchTweets();
  };

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Test Control Panel</h1>

        {/* Feed Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Feed Selection</h2>
          <select
            value={selectedFeed}
            onChange={(e) => setSelectedFeed(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="test-feed">Test Feed (Basic)</option>
            <option value="multi-approver">Multi-Approver Test</option>
            <option value="edge-cases">Edge Cases</option>
          </select>
        </div>

        {/* Content URL */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Content URL</h2>
          <input
            type="text"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="https://example.com/content"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleSubmit}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Submit Content
            </button>
            <button
              onClick={handleApprove}
              className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700"
              disabled={!submissionTweetId}
            >
              Approve Submission
            </button>
            <button
              onClick={handleReject}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700"
              disabled={!submissionTweetId}
            >
              Reject Submission
            </button>
            <button
              onClick={handleReset}
              className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700"
            >
              Reset State
            </button>
          </div>
        </div>

        {/* Current Tweets */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Current Tweets</h2>
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="border rounded p-4">
                <div className="font-medium">@{tweet.username}</div>
                <div className="text-gray-600">{tweet.text}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(tweet.timeParsed).toLocaleString()}
                  {tweet.inReplyToStatusId && (
                    <span className="ml-2">
                      (Reply to: {tweet.inReplyToStatusId})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
