import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-hidden">
      {/* Subtle ambient glow — ties inner pages to the landing/dashboard vibe */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #1e1b4b33 0%, transparent 70%)' }}
      />
      <nav className="relative bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/favicon.svg" alt="S.O.T.D." className="w-6 h-6 shrink-0" />
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`
              }
            >
              S.O.T.D.
            </NavLink>
            <NavLink
              to="/collection"
              end
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
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`
              }
            >
              About
            </NavLink>
            <span className="text-zinc-700">·</span>
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
      <main className="relative max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
