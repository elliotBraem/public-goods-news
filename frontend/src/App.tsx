import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import SubmissionList from './components/SubmissionList';

// Configure axios base URL for API requests
axios.defaults.baseURL = 'http://localhost:3000';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SubmissionList />} />
      </Routes>
    </Router>
  );
}

export default App;
