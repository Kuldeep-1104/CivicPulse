// frontend/src/pages/admin/components/Analytics.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Analytics() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/admin/complaints', {
          headers: { Authorization: `Bearer ${token}` }, // Fixed
        });

        const complaints = res.data;
        const total = complaints.length || 1;
        const pending = complaints.filter((c) => c.status === 'pending').length;
        const inProgress = complaints.filter((c) => c.status === 'in-progress').length;
        const resolved = complaints.filter((c) => c.status === 'resolved').length;

        setStats({ total, pending, inProgress, resolved });
        setLoading(false);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const total = stats.total || 1;
  const pendingPercent = (stats.pending / total) * 100;
  const inProgressPercent = (stats.inProgress / total) * 100;
  const resolvedPercent = (stats.resolved / total) * 100;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const center = 100;

  // Cumulative offsets (from 0 to 100%)
  const pendingOffset = 0;
  const inProgressOffset = circumference * (pendingPercent / 100);
  const resolvedOffset = inProgressOffset + circumference * (inProgressPercent / 100);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Analytics Dashboard
      </h2>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Issues', value: stats.total, color: 'gray', bg: 'gray-100', text: 'gray-900' },
          { label: 'Pending', value: stats.pending, color: 'yellow', bg: 'yellow-100', text: 'yellow-700' },
          { label: 'In Progress', value: stats.inProgress, color: 'blue', bg: 'blue-100', text: 'blue-700' },
          { label: 'Resolved', value: stats.resolved, color: 'green', bg: 'green-100', text: 'green-700' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium text-${item.color}-600`}>
                  {item.label}
                </p>
                <p className={`text-3xl font-bold text-${item.text} mt-2`}>
                  {item.value}
                </p>
              </div>
              <div className={`bg-${item.bg} p-3 rounded-full`}>
                <svg
                  className={`w-8 h-8 text-${item.color}-600`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {item.label === 'Total Issues' && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  )}
                  {item.label === 'Pending' && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                  {item.label === 'In Progress' && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  )}
                  {item.label === 'Resolved' && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PIE CHART */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Complaint Status Overview
        </h3>
        <div className="flex justify-center">
          <div className="relative w-64 h-64">
            <svg width="256" height="256" viewBox="0 0 200 200">
              {/* PENDING */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="36"
                strokeDasharray={`${circumference * (pendingPercent / 100)} ${circumference}`}
                strokeDashoffset={pendingOffset}
                className="transition-all duration-1000 ease-out"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />

              {/* IN PROGRESS */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="36"
                strokeDasharray={`${circumference * (inProgressPercent / 100)} ${circumference}`}
                strokeDashoffset={-inProgressOffset}
                className="transition-all duration-1000 ease-out"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />

              {/* RESOLVED */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#22c55e"
                strokeWidth="36"
                strokeDasharray={`${circumference * (resolvedPercent / 100)} ${circumference}`}
                strokeDashoffset={-resolvedOffset}
                className="transition-all duration-1000 ease-out"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>

            {/* CENTER TEXT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-bold text-gray-800">{stats.total}</span>
              <span className="text-sm text-gray-600 mt-1">Total Issues</span>
            </div>
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex justify-center gap-8 mt-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              Pending ({stats.pending} - {Math.round(pendingPercent)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              In Progress ({stats.inProgress} - {Math.round(inProgressPercent)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              Resolved ({stats.resolved} - {Math.round(resolvedPercent)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}