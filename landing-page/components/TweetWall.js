import React from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";
import tweetData from "../data/tweets.json";
import { Tweet } from "react-tweet";

const TweetWall = () => {
  return (
    <div data-theme="light">
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          padding: "20px 0",
          whiteSpace: "nowrap",
        }}
        className="hidden md:grid md:grid-cols-3"
      >
        {tweetData.tweetIds.map((tweetId, index) => (
          <div
            key={index}
            className={`p-8 ${index < 6 ? "border-b" : ""} ${
              index % 3 !== 2 ? "border-r" : ""
            } border-[#57606A]`}
          >
            <Tweet id={tweetId} />
          </div>
        ))}
      </div>
      <div className="md:hidden">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {tweetData.tweetIds.map((tweetId, index) => (
            <div
              key={index}
              className="mb-4 min-w-full flex-shrink-0 snap-center p-4 md:p-8 border-b border-[#57606A] w-[310px]"
            >
              <Tweet id={tweetId} />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-4 mb-6">
          {
            tweetData.tweetIds.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${index === 0 ? "bg-black" : "bg-gray-200"}`}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default TweetWall;
