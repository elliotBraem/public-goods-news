import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { TwitterSubmission } from "../types/twitter";

type LiveUpdateContextType = {
  connected: boolean;
  lastUpdate: { type: string; data: TwitterSubmission[] } | null;
};

const LiveUpdateContext = createContext<LiveUpdateContextType | undefined>(
  undefined,
);

export function LiveUpdateProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    type: string;
    data: TwitterSubmission[];
  } | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: number;

    const connect = () => {
      // Use the proxied WebSocket path
      // In development, Vite runs on a different port than the backend
      const isDev = import.meta.env.DEV;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = isDev
        ? `ws://localhost:3000/ws` // Direct connection to backend in development
        : `${protocol}//${window.location.host}/ws`; // Use relative path in production

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Live updates connected");
        setConnected(true);
      };

      ws.onclose = () => {
        console.log("Live updates disconnected");
        setConnected(false);
        // Try to reconnect after 3 seconds
        reconnectTimer = window.setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("Live updates error:", error);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "update") {
            setLastUpdate(data);
          }
        } catch (error) {
          console.error("Error processing update:", error);
        }
      };
    };

    connect();

    // Cleanup function
    return () => {
      window.clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <LiveUpdateContext.Provider value={{ connected, lastUpdate }}>
      {children}
    </LiveUpdateContext.Provider>
  );
}

export function useLiveUpdates() {
  const context = useContext(LiveUpdateContext);
  if (context === undefined) {
    throw new Error("useLiveUpdates must be used within a LiveUpdateProvider");
  }
  return context;
}
