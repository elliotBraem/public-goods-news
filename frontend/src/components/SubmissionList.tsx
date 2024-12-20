import { useEffect, useState } from "react";
import axios from "axios";
import { TwitterSubmission } from "../types/twitter";
import { useLiveUpdates } from "../contexts/LiveUpdateContext";
import { ExternalLink, Eye } from "lucide-react";

const BOT_ID = "test_curation";

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
  const [statusFilter, setStatusFilter] = useState<
    TwitterSubmission["status"] | "all"
  >("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Get unique categories across all submissions
  const allCategories = [
    ...new Set(submissions.flatMap((s) => s.categories || [])),
  ].sort();
  const { lastUpdate } = useLiveUpdates();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/submissions"
          : `/api/submissions?status=${statusFilter}`;
      const response = await axios.get<TwitterSubmission[]>(url);
      const data = [...response.data].reverse();

      // Filter by selected categories if any are selected
      const filteredData =
        selectedCategories.length > 0
          ? data.filter((submission) =>
              selectedCategories.every((category) =>
                submission.categories?.includes(category),
              ),
            )
          : data;

      setSubmissions(filteredData);
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
  }, [statusFilter, selectedCategories]);

  // Handle live updates
  useEffect(() => {
    if (lastUpdate?.type === "update") {
      const filteredByStatus =
        statusFilter === "all"
          ? lastUpdate.data
          : lastUpdate.data.filter((s) => s.status === statusFilter);

      const filteredByCategories =
        selectedCategories.length > 0
          ? filteredByStatus.filter((submission) =>
              selectedCategories.every((category) =>
                submission.categories?.includes(category),
              ),
            )
          : filteredByStatus;

      setSubmissions([...filteredByCategories].reverse());
    }
  }, [lastUpdate, statusFilter, selectedCategories]);

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
        <div className="flex flex-col gap-4 mb-8">
          {/* Status filters */}
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 sm:px-4 py-2 border-2 border-gray-800 font-medium transition-all ${
                    statusFilter === status
                      ? "bg-gray-800 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
          </div>

          {/* Category filters */}
          {allCategories.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Filter by Categories:
              </h3>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(category)
                          ? prev.filter((c) => c !== category)
                          : [...prev, category],
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedCategories.includes(category)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
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
                </div>
                <div className="flex items-end gap-2 flex-col">
                <a
                        href={getTweetUrl(
                          (submission.status === "pending" ?  submission.acknowledgmentTweetId :  submission.moderationResponseTweetId) || "",
                          BOT_ID
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                  <StatusBadge status={submission.status} />
                  </a>
                  
                </div>
              </div>

              {submission.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Curator's Notes:
                  </h4>
                  <p className="text-gray-700">{submission.description}</p>
                </div>
              )}

              {submission.categories && submission.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {submission.categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-gray-100 text-sm rounded-full text-gray-600 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        if (!selectedCategories.includes(category)) {
                          setSelectedCategories((prev) => [...prev, category]);
                        }
                      }}
                    >
                      {category}
                    </span>
                  ))}
                </div>
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
