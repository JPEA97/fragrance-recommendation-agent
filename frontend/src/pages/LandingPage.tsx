import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { register } from '../api/auth'
import { ApiError } from '../api/client'

type Tab = 'signin' | 'register'

export default function LandingPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('signin')

  // Sign in state
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siError, setSiError] = useState<string | null>(null)
  const [siLoading, setSiLoading] = useState(false)

  // Register state
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState<string | null>(null)
  const [regLoading, setRegLoading] = useState(false)

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setSiError(null)
    setSiLoading(true)
    try {
      await login(siEmail, siPassword)
      navigate('/dashboard')
    } catch (err) {
      setSiError(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setSiLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError(null)
    setRegLoading(true)
    try {
      await register({ email: regEmail, username: regUsername, password: regPassword })
      await login(regEmail, regPassword)
      navigate('/dashboard')
    } catch (err) {
      setRegError(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setRegLoading(false)
    }
  }

  function scrollToAuth() {
    document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-zinc-300 mb-1'

  return (
    <div className="bg-zinc-950">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Deep glow background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, #1e1b4b 0%, #09090b 65%)',
          }}
        />
        {/* Soft indigo orb */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <p className="text-indigo-400 text-xs font-semibold tracking-[0.3em] uppercase mb-8">
            S.O.T.D.
          </p>
          <h1 className="text-7xl md:text-9xl font-bold text-white leading-none tracking-tight mb-6">
            Scent of<br />
            <span className="text-indigo-400">the Day</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Your personal fragrance advisor. Build your collection, get the right recommendation every single day.
          </p>
        </div>

        {/* Scroll cue */}
        <button
          onClick={scrollToAuth}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors group"
        >
          <span className="text-xs tracking-widest uppercase">Get started</span>
          <svg
            className="w-5 h-5 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* ── Auth ─────────────────────────────────────────────── */}
      <section
        id="auth"
        className="min-h-screen flex flex-col items-center justify-center px-4 py-24"
      >
        <p className="text-zinc-500 text-sm mb-2 tracking-wide">
          Create an account or sign in to continue
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
          Your collection is waiting.
        </h2>

        <div className="w-full max-w-sm">
          {/* Tab switcher */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-4">
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === 'signin'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === 'register'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Card */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="si-email" className={labelClass}>Email</label>
                  <input
                    id="si-email"
                    type="email"
                    required
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="si-password" className={labelClass}>Password</label>
                  <input
                    id="si-password"
                    type="password"
                    required
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {siError && <p className="text-sm text-red-400">{siError}</p>}
                <button
                  type="submit"
                  disabled={siLoading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors"
                >
                  {siLoading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="reg-email" className={labelClass}>Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="reg-username" className={labelClass}>Username</label>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    minLength={3}
                    maxLength={50}
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="reg-password" className={labelClass}>Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {regError && <p className="text-sm text-red-400">{regError}</p>}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors"
                >
                  {regLoading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
