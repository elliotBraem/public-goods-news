import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmissionList from './components/SubmissionList';

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
