import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  rightPanel?: ReactNode;
}

const Layout = ({ children, sidebar, rightPanel }: LayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar - Feed List */}
      <div className="w-64 panel custom-scrollbar overflow-y-auto h-[calc(100vh-theme(spacing.24))] sm:h-[calc(100vh-theme(spacing.28))]">
        <div className="p-4">
          {sidebar}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Center Panel - Feed Items */}
        <div className="flex-1 panel custom-scrollbar overflow-y-auto h-[calc(100vh-theme(spacing.24))] sm:h-[calc(100vh-theme(spacing.28))]">
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Right Panel - Feed Details */}
        <div className="w-80 panel custom-scrollbar overflow-y-auto h-[calc(100vh-theme(spacing.24))] sm:h-[calc(100vh-theme(spacing.28))]">
          <div className="p-4">
            {rightPanel}
          </div>
        </div>
      </div>
      </div>
      <footer className="fixed bottom-0 w-full py-2 sm:py-4 text-center bg-white/80 backdrop-blur text-sm sm:text-base border-t-2 border-black">
        <a
          href="https://potlock.org"
          className="hover:text-gray-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          Curated with ❤️ by 🫕 POTLOCK
        </a>
      </footer>
    </div>
  );
}

export default Layout;
