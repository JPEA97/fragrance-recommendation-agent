import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900 tracking-tight">Fragrance</span>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/collection"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`
              }
            >
              My Collection
            </NavLink>
            <NavLink
              to="/collection/add"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`
              }
            >
              Add Fragrance
            </NavLink>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
