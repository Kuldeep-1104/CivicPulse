// frontend/src/pages/admin/ComplaintsTable.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ComplaintsTable() {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [imageModal, setImageModal] = useState(null);

  const token = localStorage.getItem('token');
  const openImage = (url) => setImageModal(url);

  // Show only 3 words + "..." but keep full text for tooltip
  const truncateDescription = (text) => {
    const words = text.trim().split(/\s+/);
    const visible = words.slice(0, 3).join(' ');
    return words.length > 3 ? visible + '...' : visible;
  };

  const fetchData = async () => {
    if (!token) {
      alert('Please log in');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/api/admin/complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setComplaints(data);

      const total = data.length;
      const pending = data.filter((c) => c.status === 'pending').length;
      const inProgress = data.filter((c) => c.status === 'in-progress').length;
      const resolved = data.filter((c) => c.status === 'resolved').length;
      setStats({ total, pending, inProgress, resolved });
    } catch (err) {
      console.error('Failed to load complaints:', err.response?.data);
      alert('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(['all', ...res.data]);
    } catch (err) {
      console.error('Failed to load categories:', err.response?.data);
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      await axios.patch(`/api/admin/complaints/${id}/priority`, { priority }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, priority } : c))
      );
    } catch (err) {
      alert('Failed to update priority');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/admin/complaints/${id}/status`, { status }, {
        headers: { Authorization:` Bearer ${token}` },
      });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;

    try {
      await axios.delete(`/api/admin/complaints/${id}`, {
        headers: { Authorization:` Bearer ${token} `},
      });
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      fetchData();
      alert('Complaint deleted');
    } catch (err) {
      alert('Delete failed');
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.area?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8 text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Manage Complaints</h2>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[
          { label: 'Total Issues', value: stats.total, color: 'gray', bg: 'gray-100', text: 'gray-900' },
          { label: 'Pending', value: stats.pending, color: 'yellow', bg: 'yellow-100', text: 'yellow-700' },
          { label: 'In Progress', value: stats.inProgress, color: 'blue', bg: 'blue-100', text: 'blue-700' },
          { label: 'Resolved', value: stats.resolved, color: 'green', bg: 'green-100', text: 'green-700' },
        ].map((item) => (
          <div key={item.label} className="bg-white p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm font-medium text-${item.color}-600`}>{item.label}</p>
                <p className={`text-xl sm:text-2xl font-bold text-${item.text}`}>{item.value}</p>
              </div>
              <div className={`bg-${item.bg} p-2 rounded-full`}>
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-${item.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.label === 'Total Issues' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
                  {item.label === 'Pending' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {item.label === 'In Progress' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                  {item.label === 'Resolved' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search description or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
          >
            <option value="all">All Types</option>
            {categories.filter((cat) => cat !== 'all').map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* RESPONSIVE TABLE / CARD VIEW */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[260px]">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Dept</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No complaints match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c._id.slice(-6)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.area || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {c.category}
                      </span>
                    </td>
                    {/* Hover to see full description */}
                    <td
                      className="px-4 py-3 text-sm text-gray-600 cursor-help"
                      title={c.description}
                    >
                      {truncateDescription(c.description)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 border-0 transition ${
                          c.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                          : c.status === 'in-progress' ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.priority || 'low'}
                        onChange={(e) => updatePriority(c._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 border-0 transition ${
                          c.priority === 'high' ? 'bg-red-100 text-red-800'
                          : c.priority === 'medium' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.assignedDepartment || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sm">
                      {c.imageUrl && (
                        <button onClick={() => openImage(c.imageUrl)} className="text-blue-600 hover:underline text-xs">
                          View
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {c.proofImage && (
                        <button onClick={() => openImage(c.proofImage)} className="text-blue-600 hover:underline text-xs">
                          View
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteComplaint(c._id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No complaints match your filters.</div>
          ) : (
            filtered.map((c) => (
              <div key={c._id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">ID:</span>
                    <p className="font-medium text-gray-900">{c._id.slice(-6)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Area:</span>
                    <p className="text-gray-700">{c.area || '—'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Type:</span>
                    <p>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {c.category}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Status:</span>
                    <p>
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 border-0 transition ${
                          c.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                          : c.status === 'in-progress' ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Priority:</span>
                    <p>
                      <select
                        value={c.priority || 'low'}
                        onChange={(e) => updatePriority(c._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 border-0 transition ${
                          c.priority === 'high' ? 'bg-red-100 text-red-800'
                          : c.priority === 'medium' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Dept:</span>
                    <p className="text-gray-700">{c.assignedDepartment || 'Unassigned'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-500">Description:</span>
                    <p
                      className="text-gray-600 mt-1 cursor-help"
                      title={c.description}
                    >
                      {truncateDescription(c.description)}
                    </p>
                  </div>
                  <div className="col-span-2 flex gap-3">
                    {c.imageUrl && (
                      <button onClick={() => openImage(c.imageUrl)} className="text-blue-600 hover:underline text-sm">
                        View Image
                      </button>
                    )}
                    {c.proofImage && (
                      <button onClick={() => openImage(c.proofImage)} className="text-blue-600 hover:underline text-sm">
                        View Proof
                      </button>
                    )}
                    <button
                      onClick={() => deleteComplaint(c._id)}
                      className="text-red-600 hover:text-red-800 transition-colors ml-auto"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* IMAGE MODAL */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setImageModal(null)}>
          <div className="relative max-w-4xl w-full max-h-screen overflow-auto">
            <img src={imageModal} alt="Complaint" className="w-full rounded-xl" />
            <button
              onClick={() => setImageModal(null)}
              className="absolute top-2 right-2 bg-white/80 px-3 py-1 rounded-full text-gray-800 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}