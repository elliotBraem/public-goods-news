import { ServerWebSocket, Server } from "bun";
import { TwitterSubmission } from "../../types";
import { logger } from "../../utils/logger";

export class WebSocketService {
  private clients = new Set<ServerWebSocket<unknown>>();

  constructor() {}

  getWebSocketConfig() {
    return {
      open: (ws: ServerWebSocket<unknown>) => this.handleOpen(ws),
      close: (ws: ServerWebSocket<unknown>) => this.handleClose(ws),
      message: (ws: ServerWebSocket<unknown>, message: string | Buffer) => this.handleMessage(ws, message),
    };
  }

  handleOpen(ws: ServerWebSocket<unknown>) {
    this.clients.add(ws);
    logger.debug('WebSocket client connected');
  }

  handleClose(ws: ServerWebSocket<unknown>) {
    this.clients.delete(ws);
    logger.debug('WebSocket client disconnected');
  }

  handleMessage(ws: ServerWebSocket<unknown>, message: string | Buffer) {
    // Handle any client messages if needed
  }

  broadcastSubmissions(submissions: TwitterSubmission[]) {
    const message = JSON.stringify({
      type: 'update',
      data: submissions,
    });

    for (const client of this.clients) {
      client.send(message);
    }
  }
}
