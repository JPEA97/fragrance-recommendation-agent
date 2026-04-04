import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function GettingStartedPage() {
  const { user } = useAuth()

  return (
    <div className="relative -mx-4 -my-8 overflow-hidden" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
      {/* Glow background */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, #1e1b4b 0%, #09090b 65%)' }}
      />
      <div
        className="absolute w-[700px] h-[700px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
              Welcome{user?.username ? `, ${user.username}` : ''}
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
              Getting Started
            </h1>
            <p className="text-zinc-400 text-lg max-w-md mx-auto">
              S.O.T.D. recommends what to wear from your own collection — tailored to the moment.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-6 mb-12">

            {/* Step 1 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-7 backdrop-blur-sm">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg mb-2">Build your collection</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    Browse the fragrance catalog and add every bottle you own. For each one you can specify whether it's a full bottle, a decant, or a sample, how many ml you have left, and a personal rating out of 5.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Full bottle', 'Decant', 'Sample', 'Personal rating', 'ML remaining'].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center">
              <div className="w-px h-6 bg-zinc-700" />
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-7 backdrop-blur-sm">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg mb-2">Tell us about your day</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    Each time you want a recommendation, answer five quick questions about your context. S.O.T.D. scores every fragrance in your collection against your answers and returns the top three picks.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Season', example: 'Spring · Summer · Fall · Winter' },
                      { label: 'Occasion', example: 'Casual · Date · Sport · Beach · Travel…' },
                      { label: 'Time of day', example: 'Morning · Day · Evening · Night' },
                      { label: 'Weather', example: 'Hot · Mild · Cold · Rainy' },
                      { label: 'Location', example: 'Indoor · Outdoor' },
                    ].map(({ label, example }) => (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-indigo-800 bg-indigo-950/50"
                      >
                        <span className="text-indigo-300 font-medium">{label}</span>
                        <span className="text-indigo-500">{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Tip */}
          <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl px-5 py-4 mb-10 text-sm text-amber-400/80 text-center">
            The more fragrances you add — and the more accurately you rate them — the better your recommendations get over time.
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/collection/add"
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center"
            >
              Add your first fragrance
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-medium border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors text-center"
            >
              Go to dashboard
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
