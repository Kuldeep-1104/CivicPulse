import { Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from '../admin/components/Sidebar.jsx'  // Reuse or create new/
import AssignedComplaints from './AssignedComplaints.jsx'  // New component
import Analytics from '../admin/components/Analytics.jsx'  // Optional

export default function DepartmentDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Department Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<AssignedComplaints />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}