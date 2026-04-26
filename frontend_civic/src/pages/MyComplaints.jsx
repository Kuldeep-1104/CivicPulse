import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { formatDistanceToNow } from 'date-fns'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [filtered, setFiltered] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [listening, setListening] = useState(false)
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(true)
  const recognitionRef = useRef(null)
  const cardRefs = useRef({})

  // Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        document.getElementById('voice-input').value = transcript
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
      setListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
  }

  // Fetch Complaints
  const fetchComplaints = async () => {
    const token = localStorage.getItem('token')
    const res = await axios.get('/api/complaints/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const withPriority = res.data.map(c => ({
      ...c,
      priority: c.priority || calculatePriority(c),
      history: c.history || [{ status: 'pending', date: c.createdAt }]
    }))
    setComplaints(withPriority)
    setFiltered(withPriority)
    setLoading(false)
  }

  useEffect(() => {
    fetchComplaints()
    const interval = setInterval(fetchComplaints, 10000) // Real-time
    return () => clearInterval(interval)
  }, [])

  // Priority Logic
  const calculatePriority = (c) => {
    let score = c.upvotes.length * 3
    if (c.imageUrl) score += 2
    if (c.description.length > 100) score += 1
    return score > 5 ? 'high' : score > 2 ? 'medium' : 'low'
  }

  // Filters & Sort
  useEffect(() => {
    let list = complaints
    if (search) list = list.filter(c => c.description.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter)
    if (categoryFilter !== 'all') list = list.filter(c => c.category === categoryFilter)
    
    const priorityScore = (c) => c.priority === 'high' ? 3 : c.priority === 'medium' ? 2 : 1

    list.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'upvotes') return b.upvotes.length - a.upvotes.length
      if (sortBy === 'priority') return priorityScore(b) - priorityScore(a)
      return 0
    })

    setFiltered(list.slice(0, page * 6))
  }, [search, statusFilter, categoryFilter, sortBy, complaints, page])

  // Nearby Complaints
  const fetchNearby = async (lat, lng) => {
    const token = localStorage.getItem('token')
    const res = await axios.get(`/api/complaints/nearby?lat=${lat}&lng=${lng}&radius=5000`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setNearby(res.data.filter(c => c._id !== selected._id))
  }

  // Mark as Urgent
  const markUrgent = async (id) => {
    const token = localStorage.getItem('token')
    await axios.post(`/api/complaints/${id}/urgent`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchComplaints()
  }

  // Export PDF
  const exportPDF = async (complaint) => {
    const card = cardRefs.current[complaint._id]
    const canvas = await html2canvas(card)
    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    pdf.addImage(img, 'PNG', 10, 10, 180, 0)
    pdf.save(`complaint_${complaint._id.slice(-6)}.pdf`)
  }

  // Share Link
  const shareComplaint = (id) => {
    const link = `${window.location.origin}/complaint/${id}`
    navigator.clipboard.writeText(link)
    alert('Link copied!')
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white/90'} backdrop-blur-sm shadow-lg p-4`}>
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Complaints
          </h1>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`px-4 py-2 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-purple-200'}`}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'border border-purple-200'}`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'border border-purple-200'}`}
            >
              <option value="all">All Categories</option>
              <option>Potholes</option>
              <option>Garbage</option>
              <option>Water</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'border border-purple-200'}`}
            >
              <option value="date">Latest</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="priority">Highest Priority</option>
            </select>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-xl"
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <Link
              to="/report"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-bold"
            >
              + New
            </Link>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(c => (
          <div
            key={c._id}
            ref={el => cardRefs.current[c._id] = el}
            className={`rounded-2xl shadow-xl overflow-hidden transition-all hover:scale-105 cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={() => { setSelected(c); fetchNearby(c.location.coordinates[1], c.location.coordinates[0]) }}
          >
            <div className="flex">
              {c.imageUrl && (
                <img src={c.imageUrl} alt="" className="w-32 h-32 object-cover" />
              )}
              <div className="p-4 flex-1">
                <div className="flex justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    c.priority === 'high' ? 'bg-red-100 text-red-800' :
                    c.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {c.priority.toUpperCase()}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="font-semibold mt-2 line-clamp-2">{c.description}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={(e) => { e.stopPropagation(); shareComplaint(c._id) }} className="text-blue-600 text-xs">Share</button>
                  <button onClick={(e) => { e.stopPropagation(); exportPDF(c) }} className="text-green-600 text-xs">PDF</button>
                  <button onClick={(e) => { e.stopPropagation(); markUrgent(c._id) }} className="text-red-600 text-xs">Urgent</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length < complaints.length && (
        <div className="text-center p-6">
          <button onClick={() => setPage(p => p + 1)} className="bg-purple-600 text-white px-6 py-2 rounded-xl">
            Load More
          </button>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className={`rounded-3xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Complaint Details</h2>

            {/* Proof Image */}
            <div className="mt-4">
              <h3 className="font-bold mb-2">Proof Image</h3>
              {selected.proofImage ? (
                <img src={selected.proofImage} alt="Proof" className="w-full max-h-64 object-cover rounded-xl shadow-md" />
              ) : (
                <p className="text-gray-500">No proof uploaded yet</p>
              )}
            </div>

            {/* Responsive Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full table-auto min-w-max overflow-x-auto block md:table">
                <thead className="block md:table-header-group">
                  <tr className="block md:table-row">
                    <th className="block md:table-cell px-4 py-2 text-left">Description</th>
                    <th className="block md:table-cell px-4 py-2 text-left">Category</th>
                    <th className="block md:table-cell px-4 py-2 text-left">Status</th>
                    <th className="block md:table-cell px-4 py-2 text-left">Upvotes</th>
                    <th className="block md:table-cell px-4 py-2 text-left">Priority</th>
                  </tr>
                </thead>
                <tbody className="block md:table-row-group">
                  <tr className="block md:table-row">
                    <td className="block md:table-cell px-4 py-2 before:content-[attr(data-label)] before:font-bold before:md:hidden" data-label="Description:">
                      {selected.description}
                    </td>
                    <td className="block md:table-cell px-4 py-2 before:content-[attr(data-label)] before:font-bold before:md:hidden" data-label="Category:">
                      {selected.category}
                    </td>
                    <td className="block md:table-cell px-4 py-2 before:content-[attr(data-label)] before:font-bold before:md:hidden" data-label="Status:">
                      {selected.status}
                    </td>
                    <td className="block md:table-cell px-4 py-2 before:content-[attr(data-label)] before:font-bold before:md:hidden" data-label="Upvotes:">
                      {selected.upvotes.length}
                    </td>
                    <td className="block md:table-cell px-4 py-2 before:content-[attr(data-label)] before:font-bold before:md:hidden" data-label="Priority:">
                      <span className="font-bold">{selected.priority}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Status History */}
            <div className="mt-6">
              <h3 className="font-bold mb-2">Status History</h3>
              <div className="space-y-1 text-sm">
                {selected.history.map((h, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{h.status}</span>
                    <span>{new Date(h.date).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Section */}
              {selected.status === 'resolved' && !selected.feedback && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-bold text-lg mb-2">Give Feedback</h3>
                  <FeedbackForm complaintId={selected._id} onFeedbackGiven={() => fetchComplaints()} />
                </div>
              )}

              {selected.feedback && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-bold text-lg mb-2">Your Feedback</h3>
                  <p><strong>Rating:</strong> ⭐ {selected.feedback.rating}</p>
                  <p><strong>Comment:</strong> {selected.feedback.comment}</p>
                  <p className="text-xs text-gray-500">
                    Given on {new Date(selected.feedback.givenAt).toLocaleString()}
                  </p>
                </div>
              )}

            {/* Map */}
            <div className="mt-6 h-64 rounded-xl overflow-hidden border">
              <MapContainer center={[selected.location.coordinates[1], selected.location.coordinates[0]]} zoom={14} style={{ height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[selected.location.coordinates[1], selected.location.coordinates[0]]} />
                <Circle center={[selected.location.coordinates[1], selected.location.coordinates[0]]} radius={500} color="blue" />
                {nearby.map(n => (
                  <Marker key={n._id} position={[n.location.coordinates[1], n.location.coordinates[0]]}>
                    <Popup>{n.description}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ✅ Feedback Form Component
function FeedbackForm({ complaintId, onFeedbackGiven }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return alert('Please select a rating')

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/complaints/${complaintId}/feedback`, { rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Feedback submitted successfully!')
      onFeedbackGiven()
    } catch (err) {
      alert(err.response?.data?.message || 'Feedback failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl shadow-md border border-purple-200 space-y-4 mt-4"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Rate Your Experience</h3>

      {/* ⭐ Star Rating */}
      <div className="flex justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl transition-transform ${
              star <= (hover || rating)
                ? 'text-yellow-400 scale-110'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Rating text label */}
      {rating > 0 && (
        <p className="text-center text-sm text-gray-600">
          {rating === 1 && '😞 Very Dissatisfied'}
          {rating === 2 && '😕 Dissatisfied'}
          {rating === 3 && '😐 Neutral'}
          {rating === 4 && '😊 Satisfied'}
          {rating === 5 && '🤩 Excellent Service'}
        </p>
      )}

      {/* 📝 Comment Box */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Feedback (optional)
        </label>
        <textarea
          rows={3}
          placeholder="Share your thoughts..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition resize-none shadow-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform duration-150"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}