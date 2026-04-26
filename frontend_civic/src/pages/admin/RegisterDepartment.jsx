import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function RegisterDepartment() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
  })
  const [departments, setDepartments] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // ---- FETCH ALL REGISTERED DEPARTMENTS ----
  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDepartments(res.data)
    } catch (err) {
      console.error('Failed to load departments:', err.response?.data)
    }
  }

  // ---- REGISTER NEW DEPARTMENT ----
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      await axios.post('/api/auth/register-department', form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMsg('Department registered successfully!')
      setForm({ name: '', email: '', password: '', department: '' })
      fetchDepartments() // refresh list
    } catch (err) {
      setMsg(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Departments</h2>

      {/* ---- REGISTER FORM ---- */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Register New Department</h3>
        {msg && (
          <p
            className={`mb-4 p-3 rounded-lg text-sm ${
              msg.includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {msg}
          </p>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Department Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Department (e.g., Electricity)"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Department'}
          </button>
        </form>
      </div>

      {/* ---- LIST OF ALL REGISTERED DEPARTMENTS ---- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <h3 className="text-lg font-semibold p-5 border-b bg-gray-50">
          Registered Departments
        </h3>
        {departments.length === 0 ? (
          <p className="p-5 text-center text-gray-500">
            No departments registered yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{dept.name}</td>
                    <td className="px-4 py-3 text-blue-600">{dept.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {dept.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(dept.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}