import { useEffect, useState } from 'react';
import axios from 'axios';

export default function FeedbacksTable() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('/api/complaints/feedbacks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error('Failed to load feedbacks:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">User Feedbacks</h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No feedbacks yet.
                </td>
              </tr>
            ) : (
              feedbacks.map((f) => (
                <tr key={f._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {f._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{f.user?.name || 'Anonymous'}</td>
                  <td className="px-6 py-4 text-sm text-indigo-600">{f.category}</td>
                  <td className="px-6 py-4 text-yellow-500 text-lg">
                    {'★'.repeat(f.feedback.rating)}{'☆'.repeat(5 - f.feedback.rating)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 italic max-w-sm truncate" title={f.feedback.comment}>
                    “{f.feedback.comment || '—'}”
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(f.feedback.givenAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}