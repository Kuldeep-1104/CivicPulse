import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ReportComplaint from './pages/ReportComplaint.jsx'  // ← ADD THIS
import MyComplaints from './pages/MyComplaints.jsx'
import PublicComplaints from './pages/PublicComplaints.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import DepartmentDashboard from './pages/department/Dashboard.jsx'
const getRole = () => localStorage.getItem('role')

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* CITIZEN ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report" element={<ReportComplaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/complaints" element={<PublicComplaints />} />
        <Route path="/department/*" element={<DepartmentDashboard />} />

        {/* ADMIN ROUTE – PROTECTED */}
        {/* <Route
          path="/admin"
          element={getRole() === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        /> */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App