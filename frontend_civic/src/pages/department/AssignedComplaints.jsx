import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([])
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('')
  const [proof, setProof] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
  const token = localStorage.getItem('token')
  const department = localStorage.getItem('department')
  if (!token || !department) {
    navigate('/')
    return
  }

  axios.get('/api/department/assigned', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    setComplaints(res.data)  // ← Only assigned
    setLoading(false)
  })
  .catch(err => {
    console.error('Failed to load:', err.response?.data)
    if (err.response?.status === 403) {
      localStorage.clear()
      navigate('/')
    }
  })
}, [navigate])

  const updateStatus = async (id) => {
    setUpdateLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('status', status)
    if (proof) formData.append('proof', proof)

    const token = localStorage.getItem('token')
    try {
      const res = await axios.patch(`/api/department/${id}/status`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      setComplaints(prev => prev.map(c => c._id === id ? res.data : c))
      setSelected(null)
      setStatus('')
      setProof(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdateLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Assigned Complaints</h2>
      {error && <p className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full table-auto min-w-max">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No assigned complaints</td>
              </tr>
            ) : (
              complaints.map(c => (
                <tr key={c._id}>
                  <td className="px-4 py-2">{c._id.slice(-6)}</td>
                  <td className="px-4 py-2">{c.category}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{c.description}</td>
                  <td className="px-4 py-2">{c.status}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelected(c)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Update */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Update Status for {selected._id.slice(-6)}</h3>
            {error && <p className="mb-2 p-2 bg-red-100 text-red-700 rounded">{error}</p>}

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border rounded mb-4"
            >
              <option value="">Select Status</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <input
              type="file"
              onChange={(e) => setProof(e.target.files[0])}
              className="w-full mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(selected._id)}
                disabled={updateLoading}
                className="flex-1 bg-green-500 text-white py-2 rounded font-bold disabled:opacity-50"
              >
                {updateLoading ? 'Updating...' : 'Submit'}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-gray-500 text-white py-2 rounded font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}