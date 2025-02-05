import { createFileRoute } from "@tanstack/react-router";
import FeedItem from "../components/FeedItem";
import FeedList from "../components/FeedList";
import Layout from "../components/Layout";
import { Modal } from "../components/Modal";
import { useFeedConfig, useFeedItems } from "../lib/api";
import { useState } from "react";
import { TwitterSubmission } from "../types/twitter";
import { useBotId } from "../lib/config";
import { getTwitterIntentUrl } from "../lib/twitter";

export const Route = createFileRoute("/feed/$feedId")({
  component: FeedPage,
});

function FeedPage() {
  const { feedId } = Route.useParams();
  const { data: feed } = useFeedConfig(feedId);
  const { data: items = [] } = useFeedItems(feedId);
  const botId = useBotId();
  const [statusFilter, setStatusFilter] = useState<
    "all" | TwitterSubmission["status"]
  >("all");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const handleDownload = (
    selectedStatus: "all" | TwitterSubmission["status"],
  ) => {
    const itemsToDownload = items.filter(
      (item) => selectedStatus === "all" || item.status === selectedStatus,
    );
    const jsonContent = JSON.stringify(itemsToDownload, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${feed?.name || "feed"}_${selectedStatus}_submissions.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloadModalOpen(false);
  };

  const DownloadModal = () => (
    <Modal
      isOpen={isDownloadModalOpen}
      onClose={() => setIsDownloadModalOpen(false)}
    >
      <h2 className="text-2xl font-bold mb-4">Download Submissions</h2>
      <p className="mb-4">Select which submissions you want to download:</p>
      <div className="space-y-2">
        <button
          onClick={() => handleDownload("all")}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 text-sm font-medium"
        >
          All Submissions
        </button>
        <button
          onClick={() => handleDownload("approved")}
          className="w-full px-4 py-2 bg-green-200 hover:bg-green-300 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 text-sm font-medium"
        >
          Approved Submissions
        </button>
        <button
          onClick={() => handleDownload("pending")}
          className="w-full px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 text-sm font-medium"
        >
          Pending Submissions
        </button>
        <button
          onClick={() => handleDownload("rejected")}
          className="w-full px-4 py-2 bg-red-200 hover:bg-red-300 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 text-sm font-medium"
        >
          Rejected Submissions
        </button>
      </div>
    </Modal>
  );

  const filteredItems = items.filter(
    (item) => statusFilter === "all" || item.status === statusFilter,
  );

  const sidebarContent = (
    <div className="p-2">
      <FeedList />
    </div>
  );

  const rightPanelContent = feed && (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      {/* Moderation Box */}
      <div className="p-1">
        <h3 className="text-2xl mb-4">Moderation</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Approvers</h4>
              <a
                href={getTwitterIntentUrl({ action: "apply", botId, feedId })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium"
              >
                apply
              </a>
            </div>
            <ul className="space-y-2">
              {feed.moderation.approvers.twitter.map((handle) => (
                <li key={handle}>
                  <a
                    href={`https://twitter.com/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-white border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-shadow duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-mono w-full"
                  >
                    <span className="bg-blue-400 text-white text-xs px-1.5 py-0.5 rounded mr-2">
                      Twitter
                    </span>
                    @{handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Stream Box */}
      <div className="p-1">
        <h3 className="heading-3 mb-4">Stream</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-shadow duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5">
            <p className="text-center font-mono text-gray-500">
              Coming soon...
            </p>
          </div>
        </div>
      </div>

      {/* Recap Box */}
      <div className="p-1">
        <h3 className="heading-3 mb-4">Recap</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-shadow duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5">
            <p className="text-center font-mono text-gray-500">
              Coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout sidebar={sidebarContent} rightPanel={rightPanelContent}>
      <DownloadModal />
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {feed?.name || "Loading..."}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {feed?.description || "No description available"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-start xl:items-center xl:justify-end">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium ${
                statusFilter === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-black"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium ${
                statusFilter === "pending"
                  ? "bg-yellow-200 text-black"
                  : "bg-gray-100 hover:bg-gray-200 text-black"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium ${
                statusFilter === "approved"
                  ? "bg-green-200 text-black"
                  : "bg-gray-100 hover:bg-gray-200 text-black"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-3 py-1.5 rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium ${
                statusFilter === "rejected"
                  ? "bg-red-200 text-black"
                  : "bg-gray-100 hover:bg-gray-200 text-black"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-medium"
            >
              Download
            </button>
          </div>
        </div>
        {filteredItems.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-8 space-y-2">
            <p className="text-gray-500">No items found</p>
            <p className="text-gray-400 text-sm">
              comment with "!submit @{botId} #{feed?.id}" to start curating
            </p>
          </div>
        ) : (
          filteredItems
            .sort(
              (a, b) =>
                new Date(b.submittedAt!).getTime() -
                new Date(a.submittedAt!).getTime(),
            )
            .map((item) => <FeedItem key={item.tweetId} submission={item} />)
        )}
      </div>
    </Layout>
  );
}

export default FeedPage;
