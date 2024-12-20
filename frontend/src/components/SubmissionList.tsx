import { useEffect, useState } from "react";
import axios from "axios";
import { TwitterSubmission } from "../types/twitter";
import { useLiveUpdates } from "../contexts/LiveUpdateContext";
import { ExternalLink } from "lucide-react";

const StatusBadge = ({ status }: { status: TwitterSubmission["status"] }) => {
  const baseClasses = "px-2 py-1 rounded-full text-sm font-semibold border";
  const statusClasses = {
    pending: "bg-yellow-200 text-yellow-900 border-yellow-400",
    approved: "bg-green-200 text-green-900 border-green-400",
    rejected: "bg-red-200 text-red-900 border-red-400",
  };
  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>
  );
};

const SubmissionList = () => {
  const [submissions, setSubmissions] = useState<TwitterSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TwitterSubmission["status"] | "all">(
    "all",
  );
  const { lastUpdate } = useLiveUpdates();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url =
        filter === "all"
          ? "/api/submissions"
          : `/api/submissions?status=${filter}`;
      const response = await axios.get<TwitterSubmission[]>(url);
      setSubmissions([...response.data].reverse());
      setError(null);
    } catch (err) {
      setError("Failed to fetch submissions");
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  // Handle live updates
  useEffect(() => {
    if (lastUpdate?.type === "update") {
      const updatedSubmissions =
        filter === "all"
          ? lastUpdate.data
          : lastUpdate.data.filter((s) => s.status === filter);
      setSubmissions([...updatedSubmissions].reverse());
    }
  }, [lastUpdate, filter]);

  const getTweetUrl = (tweetId: string, username: string) => {
    return `https://x.com/${username}/status/${tweetId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button
          onClick={fetchSubmissions}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 sm:px-4 py-2 border-2 border-gray-800 font-medium transition-all ${
                    filter === status
                      ? "bg-gray-800 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {submissions.map((submission) => (
            <div key={submission.tweetId} className="bg-white p-6 card-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://x.com/${submission.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-gray-600 font-medium transition-colors"
                      >
                        @{submission.username}
                      </a>
                      <a
                        href={getTweetUrl(
                          submission.tweetId,
                          submission.username,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title="View original post on X/Twitter"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-600 font-serif">
                        {formatDate(submission.createdAt)}
                      </span>
                    </div>
                    {(submission.status === "approved" ||
                      submission.status === "rejected") &&
                      submission.moderationHistory.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Moderated by{" "}
                          <a
                            href={`https://x.com/${submission.moderationHistory[submission.moderationHistory.length - 1].adminId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 hover:text-gray-600 transition-colors"
                          >
                            @
                            {
                              submission.moderationHistory[
                                submission.moderationHistory.length - 1
                              ].adminId
                            }
                          </a>
                        </div>
                      )}
                  </div>
                  <p className="text-lg mb-4 leading-relaxed">
                    {submission.content}
                  </p>
                  <div className="flex gap-2 mb-2">
                    {submission.hashtags.map((tag) => (
                      <span key={tag} className="text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusBadge status={submission.status} />
              </div>

              {submission.category && (
                <p className="text-gray-700 mb-3">
                  <span className="font-semibold">Category:</span>{" "}
                  {submission.category}
                </p>
              )}

              {submission.description && (
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold">Description:</span>{" "}
                  {submission.description}
                </p>
              )}
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No submissions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionList;
