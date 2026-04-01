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
    <div className="min-h-screen bg-zinc-950">
      <nav className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-white tracking-tight">S.O.T.D.</span>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/collection"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`
              }
            >
              My Collection
            </NavLink>
            <NavLink
              to="/collection/add"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`
              }
            >
              Add Fragrance
            </NavLink>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-400 hover:text-white"
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
