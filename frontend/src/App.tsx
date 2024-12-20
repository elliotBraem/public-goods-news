import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SubmissionList from "./components/SubmissionList";
import Settings from "./components/Settings";
import { LiveUpdateProvider } from "./contexts/LiveUpdateContext";
import LiveStatus from "./components/LiveStatus";

function App() {
  return (
    <LiveUpdateProvider>
      <Router>
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
            <Routes>
              <Route path="/" element={<SubmissionList />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </Router>
    </LiveUpdateProvider>
  );
}

export default App;
