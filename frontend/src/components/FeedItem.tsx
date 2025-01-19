import { HiExternalLink } from "react-icons/hi";
import { TwitterSubmissionWithFeedData } from "../types/twitter";

const getTweetUrl = (tweetId: string, username: string) => {
  return `https://x.com/${username}/status/${tweetId}`;
};

const getTwitterIntentUrl = (
  submission: TwitterSubmissionWithFeedData,
  action: "approve" | "reject",
) => {
  const baseUrl = "https://twitter.com/intent/tweet";
  // Add in_reply_to_status_id parameter to make it a reply
  const text = `@${submission.curatorUsername} !${action}`;
  const params = new URLSearchParams({
    text,
    in_reply_to: submission.curatorTweetId,
  });
  return `${baseUrl}?${params.toString()}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export const StatusBadge = ({
  status,
}: {
  status: TwitterSubmissionWithFeedData["status"];
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
  submission: TwitterSubmissionWithFeedData;
}

export const FeedItem = ({ submission }: FeedItemProps) => {

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex flex-col pr-2">
            <div className="flex justify-between">
              <div className="flex items-center">
                <span className="bg-blue-400 font-mono text-white text-xs px-1.5 py-0.5 rounded mr-2">
                  Twitter
                </span>
                <div className="flex gap-2">
                  <span className="text-gray-400">·</span>
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
                </div>
              </div>
            </div>
            <div className="flex">
              <span className="text-gray-600">
                {formatDate(submission.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div>
          <a
            href={getTweetUrl(submission.curatorTweetId, submission.curatorUsername)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <StatusBadge status={submission.status} />
          </a>
        </div>
      </div>

      <p className="text-lg leading-relaxed body-text pt-2">
        {submission.content}
      </p>

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
                    <>
                      <span className="text-gray-400 mx-1">·</span>
                      <a
                        href={getTweetUrl(
                          submission.moderationResponseTweetId!,
                          submission.moderationHistory?.[
                            submission.moderationHistory.length - 1
                          ]?.adminId,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title="View moderation response on X/Twitter"
                      >
                        <HiExternalLink className="inline h-4 w-4" />
                      </a>
                    </>
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

          {submission.status === "pending" &&
            submission.curatorNotes &&
            submission.curatorNotes.trim() !== "" && (
              <div className="p-4 border-2 border-gray-200 rounded-md bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="heading-3">Curator's Notes</h4>
                  <span className="text-gray-400">·</span>
                  <div className="text-gray-600">
                    by{" "}
                    <>
                      <a
                        href={`https://x.com/${submission.curatorUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-gray-600 transition-colors"
                      >
                        @{submission.curatorUsername}
                      </a>
                      <span className="text-gray-400 mx-1">·</span>
                      <a
                        href={getTweetUrl(
                          submission.curatorTweetId!,
                          submission.curatorUsername,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title="View curator's tweet on X/Twitter"
                      >
                        <HiExternalLink className="inline h-4 w-4" />
                      </a>
                    </>
                  </div>
                </div>
                <p className="body-text text-gray-700">
                  {submission.curatorNotes}
                </p>
              </div>
            )}
        </div>

        {submission.status === "pending" && (
          <div className="flex flex-col gap-2">
            <a
              href={getTwitterIntentUrl(submission, "approve")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-green-200 hover:bg-green-300 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium"
            >
              approve
            </a>
            <a
              href={getTwitterIntentUrl(submission, "reject")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-red-200 hover:bg-red-300 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium"
            >
              reject
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedItem;
