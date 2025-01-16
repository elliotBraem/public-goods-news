import { createFileRoute } from '@tanstack/react-router';
import Layout from '../components/Layout';
import FeedList from '../components/FeedList';
import LiveStatus from '../components/LiveStatus';
import { useFeedConfig, useFeedItems } from '../lib/api';
import FeedItem from '../components/FeedItem';

export const Route = createFileRoute('/feed/$feedId')({
  component: FeedPage,
});

function FeedPage() {
  const { feedId } = Route.useParams();
  const { data: feed } = useFeedConfig(feedId);
  const { data: items = [] } = useFeedItems(feedId);

  const sidebarContent = (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Feeds</h1>
      <FeedList />
    </div>
  );

  const rightPanelContent = feed && (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      {/* Moderation Box */}
      <div className="p-1">
        <h3 className="heading-3 mb-4">Moderation</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Approvers</h4>
            <ul className="space-y-2">
              {feed.moderation.approvers.twitter.map((handle) => (
                <li key={handle}>
                  <a
                    href={`https://twitter.com/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-white border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-shadow duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5 text-sm font-mono w-full"
                  >
                    <span className="bg-blue-400 text-white text-xs px-1.5 py-0.5 rounded mr-2">Twitter</span>
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
            <p className="text-center font-mono text-gray-500">Coming soon...</p>
          </div>
        </div>
      </div>

      {/* Recap Box */}
      <div className="p-1">
        <h3 className="heading-3 mb-4">Recap</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-shadow duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5">
            <p className="text-center font-mono text-gray-500">Coming soon...</p>
          </div>
        </div>
      </div>

      {/* Commented out plugin configurations for future use
      {feed.outputs.stream?.enabled && feed.outputs.stream.distribute && (
        <div className="p-1">
          <div className="space-y-4">
            {feed.outputs.stream.distribute.map((plugin, index) => (
              <div
                key={index}
                className="p-4 bg-white border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-shadow duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <h4 className="font-mono font-medium mb-2">{plugin.plugin}</h4>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(plugin.config, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {feed.outputs.recap?.enabled && (
        <div className="p-1">
          <div className="space-y-4">
            {feed.outputs.recap.transform && (
              <div className="p-4 bg-white border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-shadow duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5">
                <h4 className="font-mono font-medium mb-2">
                  {feed.outputs.recap.transform.plugin} (Transform)
                </h4>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(feed.outputs.recap.transform.config, null, 2)}
                </pre>
              </div>
            )}
            
            {feed.outputs.recap.distribute?.map((plugin, index) => (
              <div
                key={index}
                className="p-4 bg-white border-2 border-black shadow-sharp hover:shadow-sharp-hover transition-shadow duration-200 translate-x-0 translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <h4 className="font-mono font-medium mb-2">
                  {plugin.plugin} (Distribute)
                </h4>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(plugin.config, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
      */}
    </div>
  );

  return (
    <Layout
      sidebar={sidebarContent}
      rightPanel={rightPanelContent}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{feed?.name || 'Loading...'}</h2>
          <LiveStatus />
        </div>
        {items?.map((item) => (
          <FeedItem key={item.tweetId} submission={item} />
        ))}
      </div>

    </Layout>
  );
}
