import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useRecommendation } from '../hooks/useRecommendation'
import RecommendationResult from '../components/RecommendationResult'
import { askAgent } from '../api/agent'
import type { AgentResponse } from '../api/agent'
import { getFragranceImage } from '../lib/fragranceImages'
import type { Occasion, LocationType, RecommendationRequest, Season, TimeOfDay, Weather } from '../types/api'

// ── Step definitions ────────────────────────────────────────────────────────

const steps = [
  {
    key: 'season' as const,
    question: 'What season are you in?',
    options: [
      { value: 'spring' as Season, label: 'Spring' },
      { value: 'summer' as Season, label: 'Summer' },
      { value: 'fall' as Season, label: 'Fall' },
      { value: 'winter' as Season, label: 'Winter' },
    ],
  },
  {
    key: 'occasion' as const,
    question: "What's the occasion?",
    options: [
      { value: 'casual' as Occasion, label: 'Casual' },
      { value: 'office' as Occasion, label: 'Office' },
      { value: 'date' as Occasion, label: 'Date' },
      { value: 'wedding' as Occasion, label: 'Wedding' },
      { value: 'formal' as Occasion, label: 'Formal' },
      { value: 'party' as Occasion, label: 'Party' },
      { value: 'sport' as Occasion, label: 'Sport' },
      { value: 'beach' as Occasion, label: 'Beach' },
      { value: 'travel' as Occasion, label: 'Travel' },
    ],
  },
  {
    key: 'time_of_day' as const,
    question: 'What time of day is it?',
    options: [
      { value: 'morning' as TimeOfDay, label: 'Morning' },
      { value: 'day' as TimeOfDay, label: 'Day' },
      { value: 'evening' as TimeOfDay, label: 'Evening' },
      { value: 'night' as TimeOfDay, label: 'Night' },
    ],
  },
  {
    key: 'weather' as const,
    question: "How's the weather?",
    options: [
      { value: 'hot' as Weather, label: 'Hot' },
      { value: 'mild' as Weather, label: 'Mild' },
      { value: 'cold' as Weather, label: 'Cold' },
      { value: 'rainy' as Weather, label: 'Rainy' },
    ],
  },
  {
    key: 'location_type' as const,
    question: 'Where are you headed?',
    options: [
      { value: 'indoor' as LocationType, label: 'Indoor' },
      { value: 'outdoor' as LocationType, label: 'Outdoor' },
    ],
  },
]

const stepLabels: Record<string, string> = {
  spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter',
  casual: 'Casual', office: 'Office', date: 'Date', wedding: 'Wedding', formal: 'Formal', party: 'Party', sport: 'Sport', beach: 'Beach', travel: 'Travel',
  morning: 'Morning', day: 'Day', evening: 'Evening', night: 'Night',
  hot: 'Hot', mild: 'Mild', cold: 'Cold', rainy: 'Rainy',
  indoor: 'Indoor', outdoor: 'Outdoor',
}

// Color per step category — used both in breadcrumb and results pills
const stepColors: Record<string, string> = {
  season:      'border-emerald-800/60 bg-emerald-950/50 text-emerald-300',
  occasion:    'border-indigo-800/60  bg-indigo-950/50  text-indigo-300',
  time_of_day: 'border-amber-800/60  bg-amber-950/50   text-amber-300',
  weather:     'border-sky-800/60    bg-sky-950/50     text-sky-300',
  location_type:'border-zinc-700/60  bg-zinc-900/60    text-zinc-300',
}

// ── Component ───────────────────────────────────────────────────────────────

type Phase = 'steps' | 'loading' | 'results'
type Tab = 'wizard' | 'ask'

export default function DashboardPage() {
  // Wizard state
  const [stepIndex, setStepIndex] = useState(0)
  const [context, setContext] = useState<Partial<RecommendationRequest>>({})
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<Phase>('steps')
  const { results, error, emptyCollection, recommend } = useRecommendation()

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('wizard')

  // Ask tab state
  const [askQuery, setAskQuery] = useState('')
  const [askLoading, setAskLoading] = useState(false)
  const [askResponse, setAskResponse] = useState<AgentResponse | null>(null)
  const [askError, setAskError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Wizard helpers ─────────────────────────────────────────────────────

  function advanceTo(next: number) {
    setVisible(false)
    setTimeout(() => {
      setStepIndex(next)
      setVisible(true)
    }, 180)
  }

  function transitionTo(next: Phase, fn?: () => void) {
    setVisible(false)
    setTimeout(() => {
      fn?.()
      setPhase(next)
      setVisible(true)
    }, 200)
  }

  async function select(value: string) {
    const step = steps[stepIndex]
    const next = { ...context, [step.key]: value }
    setContext(next)

    if (stepIndex < steps.length - 1) {
      advanceTo(stepIndex + 1)
    } else {
      transitionTo('loading', async () => {
        await recommend(next as RecommendationRequest)
        transitionTo('results')
      })
    }
  }

  function restart() {
    transitionTo('steps', () => {
      setContext({})
      setStepIndex(0)
    })
  }

  const breadcrumb = steps
    .slice(0, stepIndex)
    .map((s) => {
      const val = context[s.key] as string | undefined
      return val ? { label: stepLabels[val], stepKey: s.key, index: steps.indexOf(s) } : null
    })
    .filter(Boolean) as { label: string; stepKey: string; index: number }[]

  // ── Ask helpers ────────────────────────────────────────────────────────

  async function submitAsk() {
    if (!askQuery.trim() || askLoading) return
    setAskLoading(true)
    setAskError(null)
    setAskResponse(null)
    try {
      const result = await askAgent(askQuery.trim())
      setAskResponse(result)
    } catch (e: unknown) {
      setAskError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setAskLoading(false)
    }
  }

  function resetAsk() {
    setAskQuery('')
    setAskResponse(null)
    setAskError(null)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="relative -mx-4 -my-8 overflow-hidden" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
      {/* Static base gradient */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, #1e1b4b 0%, #09090b 65%)' }}
      />
      {/* Animated floating glow orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className="w-[700px] h-[700px] rounded-full blur-3xl glow-float"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
      </div>

      <div
        className="relative z-10 flex flex-col items-center px-6 py-12 transition-opacity duration-200"
        style={{ minHeight: 'calc(100vh - 3.5rem)', opacity: visible ? 1 : 0 }}
      >
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-12 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === 'wizard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Step by step
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === 'ask'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ask
          </button>
        </div>

        {/* ── Wizard tab ── */}
        {activeTab === 'wizard' && (
          <div className="flex flex-col items-center justify-center w-full flex-1">
            {phase === 'steps' ? (
              <>
                {/* Breadcrumb — colored chips per category */}
                {breadcrumb.length > 0 && (
                  <div className="flex items-center gap-2 mb-10 flex-wrap justify-center">
                    {breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <button
                          onClick={() => advanceTo(crumb.index)}
                          className={`text-xs px-3 py-1 rounded-full border transition-opacity hover:opacity-80 ${stepColors[crumb.stepKey]}`}
                        >
                          {crumb.label}
                        </button>
                        {i < breadcrumb.length - 1 && (
                          <span className="text-zinc-700">›</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress dots */}
                <div className="flex items-center gap-1.5 mb-10">
                  {steps.map((_, i) => (
                    <span
                      key={i}
                      className={`block rounded-full transition-all duration-300 ${
                        i < stepIndex
                          ? 'w-4 h-1.5 bg-indigo-500'
                          : i === stepIndex
                          ? 'w-6 h-1.5 bg-indigo-400 dot-active'
                          : 'w-1.5 h-1.5 bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Question with ghost step number behind it */}
                <div className="relative flex justify-center mb-12 w-full max-w-xl">
                  <span
                    className="absolute -top-8 text-[170px] font-black leading-none select-none pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.035)' }}
                  >
                    {String(stepIndex + 1).padStart(2, '0')}
                  </span>
                  <h1
                    className="relative text-4xl md:text-6xl font-bold text-center tracking-tight max-w-xl bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, #c7d2fe)' }}
                  >
                    {steps[stepIndex].question}
                  </h1>
                </div>

                {/* Option buttons */}
                <div className="flex flex-wrap justify-center gap-3 max-w-xl">
                  {steps[stepIndex].options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => select(opt.value)}
                      className="px-7 py-4 rounded-2xl text-base font-medium border border-zinc-700/80
                                 bg-zinc-900/60 text-zinc-300 backdrop-blur-sm
                                 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white
                                 hover:scale-105 hover:shadow-xl hover:shadow-indigo-600/25
                                 active:scale-95 transition-all duration-200"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {stepIndex > 0 && (
                  <button
                    onClick={() => advanceTo(stepIndex - 1)}
                    className="mt-12 text-sm text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}
              </>
            ) : phase === 'loading' ? (
              /* Counter-rotating ring loader */
              <div className="flex flex-col items-center gap-8">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border border-indigo-900/50" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-indigo-400 animate-spin" />
                  <div
                    className="absolute inset-2 rounded-full border-t border-indigo-600/50 animate-spin"
                    style={{ animationDuration: '1.4s', animationDirection: 'reverse' }}
                  />
                </div>
                <p className="text-xs tracking-[0.35em] uppercase text-indigo-400/70">Finding your scent</p>
              </div>
            ) : (
              /* Results */
              <div className="w-full max-w-xl">
                {/* Colorful context pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {steps.map((s) => {
                    const val = context[s.key] as string | undefined
                    return val ? (
                      <span
                        key={s.key}
                        className={`text-xs px-3 py-1 rounded-full border ${stepColors[s.key]}`}
                      >
                        {stepLabels[val]}
                      </span>
                    ) : null
                  })}
                </div>

                {error && (
                  <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-sm text-red-400 mb-6 text-center">
                    {error}
                  </div>
                )}

                {emptyCollection && (
                  <div className="bg-amber-950/50 border border-amber-800 rounded-xl p-6 text-center mb-6">
                    <p className="text-sm font-medium text-amber-300 mb-1">Your collection is empty</p>
                    <p className="text-sm text-amber-400 mb-4">
                      Add fragrances to your collection to get personalized recommendations.
                    </p>
                    <Link
                      to="/collection/add"
                      className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                    >
                      Add your first fragrance
                    </Link>
                  </div>
                )}

                {results.length > 0 && <RecommendationResult results={results} />}

                <button
                  onClick={restart}
                  className="mt-8 w-full py-2.5 rounded-xl text-sm font-medium border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Ask tab ── */}
        {activeTab === 'ask' && (
          <div className="flex flex-col items-center w-full max-w-xl">
            {!askResponse ? (
              <>
                <h1
                  className="text-4xl md:text-5xl font-bold text-center tracking-tight mb-4 max-w-lg bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, #c7d2fe)' }}
                >
                  What's the vibe?
                </h1>
                <p className="text-zinc-500 text-center mb-10 text-sm">
                  Describe your plans and the agent will pick the right scent from your collection.
                </p>

                <div className="w-full">
                  <textarea
                    ref={textareaRef}
                    value={askQuery}
                    onChange={(e) => setAskQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        submitAsk()
                      }
                    }}
                    placeholder="e.g. something for a rainy evening date downtown"
                    rows={3}
                    className="w-full rounded-2xl bg-zinc-900/60 border border-zinc-700/80 text-white placeholder:text-zinc-600
                               px-5 py-4 text-base resize-none focus:outline-none focus:border-indigo-500/80
                               transition-colors backdrop-blur-sm"
                  />
                </div>

                {askError && (
                  <div className="w-full mt-4 bg-red-950/50 border border-red-800 rounded-xl p-4 text-sm text-red-400 text-center">
                    {askError}
                  </div>
                )}

                <button
                  onClick={submitAsk}
                  disabled={!askQuery.trim() || askLoading}
                  className="mt-4 w-full py-3.5 rounded-2xl text-base font-medium bg-indigo-600 text-white
                             hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {askLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      Thinking…
                    </>
                  ) : (
                    'Get recommendation'
                  )}
                </button>

                <p className="mt-4 text-xs text-zinc-700">Press Enter to submit · Shift+Enter for new line</p>
              </>
            ) : (
              <div className="w-full">
                <p className="text-sm text-zinc-600 text-center mb-6 italic">"{askQuery}"</p>

                <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">Agent recommendation</span>
                  </div>
                  <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{askResponse.response}</p>

                  {askResponse.picks.length > 0 && (
                    <div className="flex gap-4 mt-6 pt-5 border-t border-indigo-800/40">
                      {askResponse.picks.filter(pick =>
                        askResponse.response.toLowerCase().includes(pick.name.toLowerCase())
                      ).map((pick, i) => {
                        const img = getFragranceImage(pick.brand, pick.name)
                        return (
                          <div key={i} className="flex flex-col items-center gap-2 flex-1">
                            <div className="w-full aspect-square rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center overflow-hidden">
                              {img ? (
                                <img src={img} alt={pick.name} className="w-full h-full object-contain p-3" />
                              ) : (
                                <span className="text-4xl font-black text-indigo-400/20">{pick.name[0]}</span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-300 text-center font-medium leading-tight">{pick.name}</p>
                            <p className="text-xs text-zinc-600 text-center">{pick.brand}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-zinc-700">Session #{askResponse.session_id}</p>
                </div>

                <button
                  onClick={resetAsk}
                  className="mt-6 w-full py-2.5 rounded-xl text-sm font-medium border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                >
                  Ask again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
