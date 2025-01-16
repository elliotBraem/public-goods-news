import { HiExternalLink } from "react-icons/hi";
import { TwitterSubmission } from "../types/twitter";
import { useBotId } from "../lib/config";

const getTweetUrl = (tweetId: string, username: string) => {
  return `https://x.com/${username}/status/${tweetId}`;
};

const getTwitterIntentUrl = (
  tweetId: string,
  action: "approve" | "reject",
  botId: string,
) => {
  const baseUrl = "https://twitter.com/intent/tweet";
  // Add in_reply_to_status_id parameter to make it a reply
  const params = new URLSearchParams({
    text: `@${botId} #${action}`,
    in_reply_to: tweetId,
  });
  return `${baseUrl}?${params.toString()}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export const StatusBadge = ({
  status,
}: {
  status: TwitterSubmission["status"];
}) => {
  const baseClasses = "status-badge";
  const statusClasses = {
    pending: "bg-yellow-200 text-black",
    approved: "bg-green-200 text-black",
    rejected: "bg-red-200 text-black",
  };
  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>
  );
};

interface FeedItemProps {
  submission: TwitterSubmission;
}

export const FeedItem = ({ submission }: FeedItemProps) => {
  const botId = useBotId();
  const tweetId =
    submission.status === "pending"
      ? submission.acknowledgmentTweetId
      : submission.moderationResponseTweetId;

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex flex-col gap-2">
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
                <HiExternalLink className="h-4 w-4" />
              </a>
              <span className="text-gray-500">·</span>
              <span className="text-gray-600 font-serif">
                {formatDate(submission.createdAt)}
              </span>
            </div>
          </div>
          <p className="text-lg mb-4 leading-relaxed body-text">
            {submission.content}
          </p>
        </div>
        <div>
          {tweetId && (
            <a
              href={getTweetUrl(tweetId, botId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <StatusBadge status={submission.status} />
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-start gap-8">
        <div className="flex-1">
          {(submission.status === "approved" ||
            submission.status === "rejected") &&
            submission.moderationHistory?.length > 0 && (
              <div className="p-4 border-2 border-gray-200 rounded-md bg-gray-50 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="heading-3">Moderation Notes</h4>
                  <span className="text-gray-400">·</span>
                  <div className="text-gray-600">
                    by{" "}
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
                </div>
                {submission.moderationHistory?.[
                  submission.moderationHistory.length - 1
                ]?.note && (
                  <p className="body-text text-gray-700">
                    {
                      submission.moderationHistory?.[
                        submission.moderationHistory.length - 1
                      ]?.note
                    }
                  </p>
                )}
              </div>
            )}

          {submission.status === "pending" && (
            <div className="p-4 border-2 border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="heading-3">Curator's Notes</h4>
                <span className="text-gray-400">·</span>
                <div className="text-gray-600">
                  by{" "}
                  <a
                    href={`https://x.com/${submission.curatorUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-gray-600 transition-colors"
                  >
                    @{submission.curatorUsername}
                  </a>
                </div>
              </div>
              <p className="body-text text-gray-700">
                {submission.description}
              </p>
            </div>
          )}
        </div>

        {submission.status === "pending" &&
          submission.acknowledgmentTweetId && (
            <div className="flex flex-col gap-2">
              <a
                href={getTwitterIntentUrl(
                  submission.acknowledgmentTweetId,
                  "approve",
                  botId,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-green-200 hover:bg-green-300 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium"
              >
                Approve
              </a>
              <a
                href={getTwitterIntentUrl(
                  submission.acknowledgmentTweetId,
                  "reject",
                  botId,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-red-200 hover:bg-red-300 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium"
              >
                Reject
              </a>
            </div>
          )}
      </div>
    </div>
  );
};

export default FeedItem;
