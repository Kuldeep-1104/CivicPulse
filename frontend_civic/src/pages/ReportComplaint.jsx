import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const categories = [
  'Potholes', 'Garbage Collection', 'Street Lights', 'Water Leakage',
  'Sewage Issues', 'Noise Pollution', 'Illegal Parking', 'Public Safety',
  'Broken Roads', 'Overgrowth', 'Uncollected Trash', 'Other'
]

export default function ReportComplaint() {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Potholes')  // ← Citizen selects
  const [area, setArea] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [priority, setPriority] = useState("");
  const [location, setLocation] = useState({ lat: '', lng: '' })
  const [useManualLocation, setUseManualLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Auto GPS
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6)
        })
        setUseManualLocation(true)
        setLoading(false)
      },
      () => {
        alert('Location access denied')
        setLoading(false)
      }
    )
  }

  // Image Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }
  // 🔮 Auto ML Priority Prediction
const handleDescriptionBlur = async () => {
  if (!description || !description.trim()) return;

  try {
    const res = await fetch("http://localhost:5000/api/ml/predict-priority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description }),
    });

    const data = await res.json();
    setPriority(data.priority); // "High" / "Medium" / "Low"
  } catch (err) {
    console.error("ML Error:", err);
  }
};

  // Submit – SEND CITIZEN'S CATEGORY
  const handleSubmit = async (e) => {
    e.preventDefault()

    const lat = parseFloat(location.lat)
    const lng = parseFloat(location.lng)
    if (isNaN(lat) || isNaN(lng)) {
      alert('Invalid coordinates')
      return
    }

    const formData = new FormData()
    formData.append('description', description)
    formData.append('category', category)  // ← CRITICAL: SEND EXACT CATEGORY
    formData.append('area', area)
    formData.append('image', image)
    formData.append('location', JSON.stringify({ lat, lng }))
    formData.append('priority', (priority || 'low').toLowerCase())

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/complaints', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('Complaint submitted successfully!')
      navigate('/complaints')
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Report New Issue
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CATEGORY – CITIZEN SELECTS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Problem <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* AREA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area / Locality <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Karol Bagh, Delhi"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              placeholder="Describe the issue in detail..."
              required
            />
            {priority && (
                  <p
                    className={`mt-2 font-semibold ${
                      priority === "High"
                        ? "text-red-600"
                        : priority === "Medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    AI Suggested Priority: {priority}
                  </p>
                )}
          </div>

          {/* IMAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl shadow-md" />
              </div>
            )}
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={getLocation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 disabled:opacity-50 transition"
              >
                Auto-Detect My Location (GPS)
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useManualLocation}
                  onChange={(e) => setUseManualLocation(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium">Or enter manually</label>
              </div>

              {useManualLocation && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Latitude"
                    value={location.lat}
                    onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    step="any"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    value={location.lng}
                    onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    step="any"
                    required
                  />
                </div>
              )}

              {location.lat && location.lng && (
                <p className="text-sm text-green-600 font-medium">
                  Location: {location.lat}, {location.lng}
                </p>
              )}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:from-indigo-700 disabled:opacity-50 transition shadow-lg"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  )
}