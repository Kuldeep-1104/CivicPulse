import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function PublicComplaints() {
  const [complaints, setComplaints] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [upvoting, setUpvoting] = useState({})

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/complaints/public', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setComplaints(res.data)
      setFiltered(res.data)
    } catch (err) {
      console.error('Failed to load complaints:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async (id) => {
    if (upvoting[id]) return
    setUpvoting(prev => ({ ...prev, [id]: true }))

    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      if (!token || !userId) {
        alert('Please login to upvote')
        return
      }

      const res = await axios.post(`/api/complaints/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setComplaints(prev =>
        prev.map(c => c._id === id ? { ...c, upvotes: res.data.upvotes } : c)
      )
    } catch (err) {
      alert(err.response?.data?.message || 'Upvote failed')
    } finally {
      setUpvoting(prev => ({ ...prev, [id]: false }))
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  useEffect(() => {
    let list = complaints

    // Search
    if (search) {
      list = list.filter(c =>
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.area?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filters
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter)
    if (categoryFilter !== 'all') list = list.filter(c => c.category === categoryFilter)
    if (priorityFilter !== 'all') list = list.filter(c => c.priority === priorityFilter)

    // Date filter
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      list = list.filter(c => new Date(c.createdAt) > cutoff)
    }

    setFiltered(list)
  }, [search, statusFilter, categoryFilter, priorityFilter, dateFilter, complaints])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">All Community Complaints</h1>
          <Link
            to="/report"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-indigo-700 transition"
          >
            + Report New Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search by description or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Potholes">Potholes</option>
              <option value="Garbage Collection">Garbage</option>
              <option value="Street Lights">Street Lights</option>
              <option value="Water Leakage">Water</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upvotes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(c => {
                    const userId = localStorage.getItem('userId')
                    const hasUpvoted = userId && c.upvotes.includes(userId)

                    return (
                      <tr key={c._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {c._id.slice(-6)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {c.area || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {c.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={c.description}>
                          {c.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            c.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            c.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            c.priority === 'high' ? 'bg-red-100 text-red-800' :
                            c.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {c.upvotes.length}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleUpvote(c._id)}
                            disabled={upvoting[c._id] || hasUpvoted}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                              hasUpvoted
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : upvoting[c._id]
                                ? 'bg-gray-300 text-gray-600'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            {upvoting[c._id] ? 'Voting...' : hasUpvoted ? 'Upvoted' : 'Upvote'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}