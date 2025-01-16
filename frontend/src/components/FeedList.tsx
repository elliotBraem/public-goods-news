import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";

interface Feed {
  id: string;
  name: string;
  hashtag: string;
}

const FeedList = () => {
  const { feedId } = useParams({ from: "/feed/$feedId" });

  const { data: feeds = [] } = useQuery<Feed[]>({
    queryKey: ["feeds"],
    queryFn: async () => {
      const response = await fetch("/api/feeds");
      if (!response.ok) {
        throw new Error("Failed to fetch feeds");
      }
      return response.json();
    },
  });

  return (
    <nav className="md:space-y-2 flex md:block">
      {feeds?.map((feed) => (
        <Link
          key={feed.id}
          to="/feed/$feedId"
          params={{ feedId: feed.id }}
          className={`flex-shrink-0 min-w-[200px] mx-2 first:ml-0 last:mr-0 md:mx-0 md:min-w-0 block px-4 py-2 text-sm border-2 border-black shadow-sharp transition-all duration-200 md:mb-2 ${
            feedId === feed.id
              ? "bg-gray-100 text-black font-medium translate-x-0.5 translate-y-0.5 shadow-none"
              : "text-gray-600 hover:shadow-sharp-hover hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <span className="flex-1">{feed.name}</span>
            <span className="text-xs text-gray-400">#{feed.hashtag}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
};

export default FeedList;
