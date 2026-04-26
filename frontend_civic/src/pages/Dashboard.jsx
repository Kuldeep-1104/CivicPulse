import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const [tab, setTab] = useState('all') // all | nearby
  const [complaints, setComplaints] = useState([])
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all'
  })
  const [userLocation, setUserLocation] = useState(null)
  const [upvoting, setUpvoting] = useState({})
  const navigate = useNavigate()

  // Fetch All Complaints
  const fetchAll = async () => {
    try {
      const res = await axios.get('/api/complaints/public')
      setComplaints(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  // Get Nearby (Top 10)
  const getNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserLocation({ lat, lng })

        const token = localStorage.getItem('token')
        try {
          const res = await axios.get(`/api/complaints/nearby?lat=${lat}&lng=${lng}&radius=10000`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setNearby(res.data.slice(0, 10))
        } catch (err) {
          console.error(err)
        }
      },
      () => alert('Location access denied')
    )
  }

  useEffect(() => {
    fetchAll()
    getNearby()
    setLoading(false)
  }, [])

  // Filter
  const applyFilters = (list) => {
    return list.filter(c => {
      if (filters.status !== 'all' && c.status !== filters.status) return false
      if (filters.category !== 'all' && c.category !== filters.category) return false
      if (filters.priority !== 'all' && c.priority !== filters.priority) return false
      return true
    })
  }

  const filteredAll = applyFilters(complaints)
  const filteredNearby = applyFilters(nearby)
  const currentData = tab === 'all' ? filteredAll : filteredNearby

  // Upvote (ONLY IN NEARBY)
  const handleUpvote = async (id) => {
    if (upvoting[id]) return
    setUpvoting(prev => ({ ...prev, [id]: true }))

    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please login to upvote')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(`/api/complaints/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setNearby(prev => prev.map(c => c._id === id ? { ...c, upvotes: res.data.upvotes } : c))
    } catch (err) {
      alert(err.response?.data?.message || 'Upvote failed')
    } finally {
      setUpvoting(prev => ({ ...prev, [id]: false }))
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

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
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            
            <div className="flex gap-3">
              <Link
                to="/report"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 transition"
              >
                + Report New Issue
              </Link>

              <Link
                to="/my-complaints"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-teal-600 transition"
              >
                My Complaints
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('all')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                tab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Complaints ({filteredAll.length})
            </button>
            <button
              onClick={() => setTab('nearby')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                tab === 'nearby'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nearby ({filteredNearby.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Potholes">Potholes</option>
              <option value="Garbage Collection">Garbage</option>
              <option value="Street Lights">Street Lights</option>
              <option value="Water Leakage">Water</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upvotes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  {tab === 'nearby' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                  )}
                  {tab === 'nearby' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={tab === 'nearby' ? 10 : 8} className="text-center py-8 text-gray-500">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  currentData.map(c => {
                    const userId = localStorage.getItem('userId')
                    const hasUpvoted = tab === 'nearby' && userId && c.upvotes.includes(userId)
                    const distance = tab === 'nearby' && userLocation
                      ? `${Math.round(
                          Math.sqrt(
                            Math.pow(c.location.coordinates[1] - userLocation.lat, 2) +
                            Math.pow(c.location.coordinates[0] - userLocation.lng, 2)
                          ) * 111000
                        )} m`
                      : null

                    return (
                      <tr key={c._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium">{c._id.slice(-6)}</td>
                        <td className="px-4 py-3 text-sm">{c.area || '—'}</td>
                        <td className="px-4 py-3 text-sm">{c.category}</td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate" title={c.description}>
                          {c.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            c.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            c.priority === 'high' ? 'bg-red-100 text-red-800' :
                            c.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{c.upvotes.length}</td>
                        <td className="px-4 py-3 text-sm">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </td>
                        {tab === 'nearby' && (
                          <td className="px-4 py-3 text-sm text-indigo-600 font-medium">
                            {distance}
                          </td>
                        )}
                        {tab === 'nearby' && (
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
                        )}
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