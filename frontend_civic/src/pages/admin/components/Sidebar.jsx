import { NavLink } from 'react-router-dom'
import { Home, MapPin, BarChart3, AlertTriangle, MessageSquare } from 'lucide-react'


export default function Sidebar() {
  const activeClass = 'bg-indigo-700 text-white'
  const inactiveClass = 'text-gray-300 hover:bg-indigo-600 hover:text-white'

  return (
    <div className="w-64 bg-indigo-800 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-700">
        <h1 className="text-2xl font-bold">CivicPulse</h1>
        {/* <p className="text-xs text-indigo-300">Admin Panel</p> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {/* ISSUES (Complaints Table) */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition font-medium ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Issues</span>
        </NavLink>

        {/* Analytics */}
        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition font-medium ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Analytics</span>
        </NavLink>

        {/* Optional: Register Department */}
        <NavLink
          to="/admin/register-department"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition font-medium ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H9a2 2 0 01-2-2v-1a6 6 0 0112 0v1a2 2 0 01-2 2zm-3-1h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Register Dept</span>
        </NavLink>
        <NavLink
          to="/admin/feedbacks"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition font-medium ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H9a2 2 0 01-2-2v-1a6 6 0 0112 0v1a2 2 0 01-2 2zm-3-1h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Feedback</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-700 text-xs text-indigo-300">
        <p>© 2025 CivicPulse</p>
        <p className="mt-1">v1.0.0</p>
      </div>
    </div>
  )
}