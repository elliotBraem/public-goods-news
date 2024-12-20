import { beforeAll, mock } from "bun:test";

// Mock environment variables
process.env.PORT = "3000";
process.env.NODE_ENV = "test";

// Mock Bun server
const mockServer = {
  upgrade: mock(() => true),
  fetch: mock(() => new Response()),
  publish: mock(() => {}),
  unsubscribe: mock(() => {}),
  reload: mock(() => {}),
  pendingWebSockets: new Set(),
  stop: mock(() => {})
};

const mockFile = {
  exists: mock(() => Promise.resolve(true)),
  text: mock(() => Promise.resolve("")),
  stream: mock(() => new ReadableStream()),
  size: 0,
  type: "text/plain"
};

// Create a proxy to handle server initialization
const serverProxy = new Proxy(mockServer, {
  get: (target, prop) => {
    if (prop === 'upgrade') {
      return (req: Request) => true;
    }
    return target[prop as keyof typeof target];
  }
});

globalThis.Bun = {
  serve: mock(() => serverProxy),
  file: mock((path: string) => mockFile)
} as any;

// Mock logger
const mockLogger = {
  info: mock(() => {}),
  error: mock(() => {}),
  debug: mock(() => {})
};

const mockSpinner = {
  startSpinner: mock(() => {}),
  succeedSpinner: mock(() => {}),
  failSpinner: mock(() => {}),
  cleanup: mock(() => {})
};

// Mock modules
import { logger } from "../utils/logger";
Object.assign(logger, mockLogger);
Object.assign(logger, mockSpinner);

// Mock config
import config from "../config/config";
Object.assign(config, {
  twitter: {
    username: "test_user",
    password: "test_pass",
    email: "test@example.com"
  }
});

// Mock ADMIN_ACCOUNTS
import { ADMIN_ACCOUNTS } from "../config/admins";
(ADMIN_ACCOUNTS as any) = ["admin"];

// Mock server functions
import { main, broadcastUpdate } from "../index";
Object.assign(main, mock(() => Promise.resolve()));
Object.assign(broadcastUpdate, mock(() => {}));
