import { useEffect, useState } from 'react';
import axios from 'axios';
import { TwitterSubmission } from '../types/twitter';
import { useLiveUpdates } from '../contexts/LiveUpdateContext';

const StatusBadge = ({ status }: { status: TwitterSubmission['status'] }) => {
  const className = `status-badge status-${status}`;
  return <span className={className}>{status}</span>;
};

const SubmissionList = () => {
  const [submissions, setSubmissions] = useState<TwitterSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TwitterSubmission['status'] | 'all'>('all');
  const { connected, lastUpdate } = useLiveUpdates();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/submissions'
        : `/api/submissions?status=${filter}`;
      const response = await axios.get<TwitterSubmission[]>(url);
      setSubmissions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  // Handle live updates
  useEffect(() => {
    if (lastUpdate?.type === 'update') {
      const updatedSubmissions = filter === 'all'
        ? lastUpdate.data
        : lastUpdate.data.filter(s => s.status === filter);
      setSubmissions(updatedSubmissions);
    }
  }, [lastUpdate, filter]);

  const getTweetUrl = (tweetId: string, username: string) => {
    return `https://x.com/${username}/status/${tweetId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button 
          onClick={fetchSubmissions}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Public Goods News Submissions</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-2`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Live Updates' : 'Connecting...'}
            </span>
          </div>
          <div className="space-x-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {submissions.map((submission) => (
          <div
            key={submission.tweetId}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <a 
                    href={getTweetUrl(submission.tweetId, submission.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    @{submission.username}
                  </a>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">{formatDate(submission.createdAt)}</span>
                </div>
                <p className="text-lg font-medium mb-2">{submission.content}</p>
                <div className="flex gap-2 mb-2">
                  {submission.hashtags.map((tag) => (
                    <span key={tag} className="text-blue-600">#{tag}</span>
                  ))}
                </div>
              </div>
              <StatusBadge status={submission.status} />
            </div>

            {submission.category && (
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Category:</span> {submission.category}
              </p>
            )}
            
            {submission.description && (
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">Description:</span> {submission.description}
              </p>
            )}

            {submission.moderationHistory.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold mb-2">Moderation History</h3>
                <div className="space-y-2">
                  {submission.moderationHistory.map((history, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      <span className="font-medium">{history.action}</span> by {history.adminId} on{' '}
                      {new Date(history.timestamp).toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No submissions found
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;
