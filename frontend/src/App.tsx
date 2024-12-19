import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SubmissionList from "./components/SubmissionList";
import { LiveUpdateProvider } from "./contexts/LiveUpdateContext";

function App() {
  return (
    <LiveUpdateProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SubmissionList />} />
        </Routes>
      </Router>
    </LiveUpdateProvider>
  );
}

export default App;
