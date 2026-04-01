import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const features = [
  {
    title: 'Your rotation, ranked.',
    body: 'Every recommendation comes from what you actually own. No ads, no sponsored picks, no "bestsellers". Just your bottles.',
  },
  {
    title: 'Context is everything.',
    body: 'A cold rainy evening calls for something different than a summer wedding. S.O.T.D. reads the room so you don\'t have to.',
  },
  {
    title: 'Built for collectors.',
    body: 'Track full bottles, decants, and samples. Log wear count and personal ratings so the engine keeps getting sharper.',
  },
]

export default function AboutPage() {
  const { user } = useAuth()

  return (
    <div className="bg-zinc-950 min-h-screen">
      {/* ── Nav ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6 max-w-5xl mx-auto">
        <Link
          to="/"
          className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors tracking-tight"
        >
          ← S.O.T.D.
        </Link>
        {user ? (
          <Link
            to="/dashboard"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Go to app →
          </Link>
        ) : (
          <Link
            to="/"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Get started →
          </Link>
        )}
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-16 pb-32">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 30%, #1e1b4b 0%, #09090b 65%)' }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', top: 0, left: '50%', transform: 'translateX(-50%)' }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-indigo-400 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            About S.O.T.D.
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-8">
            Built for the<br />
            <span className="text-indigo-400">obsessed.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            S.O.T.D. was made for fragheads who've built a collection so deep that choosing
            what to wear has become its own problem.
          </p>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────── */}
      <section className="relative max-w-3xl mx-auto px-6 pb-24">
        <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
          <p>
            You know the feeling. Forty bottles on the shelf, fifteen minutes gone,
            and you walked out wearing the same one you always do — because it was
            the first one you grabbed.
          </p>
          <p>
            <span className="text-white font-medium">Scent of the Day fixes that.</span>{' '}
            Add your collection, tell it the season, the weather, the occasion, where
            you're headed — and it recommends the perfect pull from your rotation.
            Not what's trending. Not what an algorithm thinks you should buy.
            What you already own, matched to your day.
          </p>
          <p>
            It's a tool for the people who take fragrance seriously. The ones who
            know the difference between a morning skin scent and a night-out statement.
            The ones who track their decants, rate their bottles, and still argue
            that reformulations ruined everything.
          </p>
          <p className="text-indigo-400 font-medium text-xl">
            This one's for you.
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-6 pb-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, #1e1b4b22 0%, transparent 70%)' }}
        />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h3 className="text-white font-semibold text-lg mb-3">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative text-center px-6 pb-32">
        <p className="text-zinc-500 text-sm mb-3">Ready to stop guessing?</p>
        <Link
          to={user ? '/dashboard' : '/'}
          className="inline-block px-8 py-3.5 rounded-2xl text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          {user ? 'Back to the app' : 'Get started'}
        </Link>
      </section>
    </div>
  )
}
