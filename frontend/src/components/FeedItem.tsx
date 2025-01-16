import { ExternalLink } from "lucide-react";
import { TwitterSubmission } from "../types/twitter";

const BOT_ID = "test_curation";

const getTweetUrl = (tweetId: string, username: string) => {
  return `https://x.com/${username}/status/${tweetId}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export const StatusBadge = ({ status }: { status: TwitterSubmission["status"] }) => {
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

interface FeedItemProps {
  submission: TwitterSubmission;
}

export const FeedItem = ({ submission }: FeedItemProps) => {
  return (
    <div className="bg-white p-6 card-shadow">
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
                href={getTweetUrl(submission.tweetId, submission.username)}
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
            {(submission.status === "approved" || submission.status === "rejected") &&
              submission.moderationHistory?.length > 0 && (
                <div className="text-sm space-y-2">
                  <div className="text-gray-600">
                    Moderated by{" "}
                    <a
                      href={`https://x.com/${submission.moderationHistory?.[submission.moderationHistory.length - 1]?.adminId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-800 hover:text-gray-600 transition-colors"
                    >
                      @
                      {
                        submission.moderationHistory?.[
                          submission.moderationHistory.length - 1
                        ]?.adminId
                      }
                    </a>
                  </div>
                  {submission.moderationHistory?.[
                    submission.moderationHistory.length - 1
                  ]?.note && (
                    <div className="text-gray-700">
                      <span className="font-semibold">Moderation Note:</span>{" "}
                      {
                        submission.moderationHistory?.[
                          submission.moderationHistory.length - 1
                        ]?.note
                      }
                    </div>
                  )}
                </div>
              )}
          </div>
          <p className="text-lg mb-4 leading-relaxed">{submission.content}</p>
        </div>
        <div className="flex items-end gap-2 flex-col">
          <a
            href={getTweetUrl(
              (submission.status === "pending"
                ? submission.acknowledgmentTweetId
                : submission.moderationResponseTweetId) || "",
              BOT_ID,
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

    </div>
  );
};

export default FeedItem;
