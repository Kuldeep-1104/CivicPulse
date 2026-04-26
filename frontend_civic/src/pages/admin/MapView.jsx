import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default function MapView() {
  const [complaints, setComplaints] = useState([])

  const fetchComplaints = async () => {
    const token = localStorage.getItem('token')
    const res = await axios.get('/api/admin/complaints', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setComplaints(res.data.filter(c => c.location?.coordinates))
  }

  useEffect(() => { fetchComplaints() }, [])

  return (
    <div className="p-8 h-full">
      <h2 className="text-3xl font-bold mb-6">Live Map</h2>
      <div className="bg-white rounded-xl shadow h-96">
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {complaints.map(c => (
            <Marker
              key={c._id}
              position={[c.location.coordinates[1], c.location.coordinates[0]]}
            >
              <Popup>
                <div className="text-sm">
                  <p><strong>{c.description}</strong></p>
                  <p>Status: <span className="font-medium">{c.status}</span></p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}