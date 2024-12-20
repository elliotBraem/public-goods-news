import { useLiveUpdates } from "../contexts/LiveUpdateContext";

const LiveStatus = () => {
  const { connected } = useLiveUpdates();

  return (
    <div className="flex items-center">
      <div
        className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"} mr-2`}
      ></div>
      <span className="text-sm text-gray-600">
        {connected ? "Live" : "Connecting..."}
      </span>
    </div>
  );
};

export default LiveStatus;
