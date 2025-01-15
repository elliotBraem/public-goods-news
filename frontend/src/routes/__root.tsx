import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import LiveStatus from "../components/LiveStatus";
import { LiveUpdateProvider } from "../contexts/LiveUpdateContext";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <LiveUpdateProvider>
        <div>
          <nav className="bg-white border-b-2 border-gray-800 p-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <Link to="/" className="hover:text-gray-600 transition-colors">
                  <h1 className="text-2xl font-bold">Curation Bot</h1>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <LiveStatus />
                <Link
                  to="/"
                  className="hover:text-gray-600 font-medium transition-colors"
                >
                  Submissions
                </Link>
                <Link
                  to="/settings"
                  className="hover:text-gray-600 font-medium transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto min-h-screen">
            <Outlet />
          </div>
        </div>
      </LiveUpdateProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
