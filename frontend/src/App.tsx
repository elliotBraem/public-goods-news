import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SubmissionList from "./components/SubmissionList";
import Settings from "./components/Settings";
import { LiveUpdateProvider } from "./contexts/LiveUpdateContext";

function App() {
  return (
    <LiveUpdateProvider>
      <Router>
        <div>
          <nav className="bg-gray-800 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between">
              <Link to="/" className="hover:text-gray-300">Submissions</Link>
              <Link to="/settings" className="hover:text-gray-300">Settings</Link>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<SubmissionList />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </LiveUpdateProvider>
  );
}

export default App;
