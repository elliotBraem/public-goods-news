import { TwitterSubmissionWithFeedData } from "../types/twitter";

export const getTweetUrl = (tweetId: string, username: string) => {
  return `https://x.com/${username}/status/${tweetId}`;
};

type TwitterAction = "approve" | "reject" | "apply";

export const getTwitterIntentUrl = (
  params: {
    action: TwitterAction;
    botId: string;
    feedId?: string;
  } & (
    | { action: "approve" | "reject"; submission: TwitterSubmissionWithFeedData }
    | { action: "apply"; submission?: never }
  )
) => {
  const baseUrl = "https://twitter.com/intent/tweet";
  const urlParams = new URLSearchParams();

  if (params.action === "apply") {
    // Apply action tags the bot and includes feed hashtag
    urlParams.set("text", `!apply @${params.botId} #${params.feedId} I want to be a curator because...`);
  } else {
    // Approve/reject actions are replies to submissions
    urlParams.set("text", `!${params.action}`);
    urlParams.set("in_reply_to", params.submission.curatorTweetId);
  }

  return `${baseUrl}?${urlParams.toString()}`;
};
