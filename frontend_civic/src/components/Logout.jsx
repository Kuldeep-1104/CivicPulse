import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Logout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    delete axios.defaults.headers.common['Authorization']
    navigate('/')
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700"
    >
      Logout
    </button>
  )
}