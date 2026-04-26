import { Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import ComplaintsTable from './ComplaintsTable.jsx'
import Analytics from './components/Analytics.jsx'
import RegisterDepartment from './RegisterDepartment.jsx'
import FeedbacksTable from './FeedbacksTable.jsx'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Logout */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition duration-200 shadow-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<ComplaintsTable />} />
            <Route path="/complaints" element={<ComplaintsTable />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/register-department" element={<RegisterDepartment />} />
            <Route path="/feedbacks" element={<FeedbacksTable />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}