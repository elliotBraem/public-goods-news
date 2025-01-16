import { ServerWebSocket } from "bun";
import { logger } from "../../utils/logger";

export class WebSocketService {
  // Store active connections
  private activeConnections = new Map<string, Set<ServerWebSocket>>();

  /**
   * Add a new WebSocket connection
   */
  public addConnection(ip: string, ws: ServerWebSocket): boolean {
    // Initialize connection set for IP if needed
    if (!this.activeConnections.has(ip)) {
      this.activeConnections.set(ip, new Set());
    }

    const connections = this.activeConnections.get(ip)!;
    connections.add(ws);
    logger.debug(`WebSocket client connected from ${ip}`);
    return true;
  }

  /**
   * Remove a WebSocket connection
   */
  public removeConnection(ip: string, ws: ServerWebSocket): void {
    const connections = this.activeConnections.get(ip);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.activeConnections.delete(ip);
      }
      logger.debug(`WebSocket client disconnected from ${ip}`);
    }
  }

  /**
   * Broadcast a message to all connected clients
   */
  public broadcast(data: unknown): void {
    const message = JSON.stringify(data);
    for (const [ip, connections] of this.activeConnections.entries()) {
      connections.forEach((ws) => {
        try {
          ws.send(message);
        } catch (error) {
          logger.error(
            `Error broadcasting to WebSocket client (${ip}):`,
            error,
          );
          this.removeConnection(ip, ws);
        }
      });
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
