import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

const diffColor = { Hard: 'var(--error)', Medium: '#f4a261', Easy: 'var(--primary)' }

function formatDuration(min) {
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return m === 0 ? `${h} hr${h > 1 ? 's' : ''}` : `${h}h ${m}m`
  }
  return `${min} min`
}

export default function MockTests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [testsRes, attemptsRes] = await Promise.all([
        supabase
          .from('mock_tests')
          .select('*')
          .order('id', { ascending: true }),
        user
          ? supabase
              .from('mock_test_attempts')
              .select('mock_test_id, status, score, started_at')
              .eq('user_id', user.id)
              .order('started_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
      ])
      if (cancelled) return

      if (testsRes.error) { setError(testsRes.error); setLoading(false); return }

      const attemptByTest = new Map()
      for (const a of attemptsRes.data || []) {
        if (!attemptByTest.has(a.mock_test_id)) attemptByTest.set(a.mock_test_id, a)
      }

      const enriched = (testsRes.data || []).map(t => {
        const latest = attemptByTest.get(t.id)
        return {
          ...t,
          score: latest?.status === 'completed' ? Math.round(Number(latest.score) || 0) : null,
          inProgress: latest?.status === 'started',
        }
      })
      setTests(enriched)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const shown = tests.filter(t => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return t.score == null
    return t.score != null
  })

  async function handleStart(test) {
    if (!user) { navigate('/login'); return }
    const { data: existing } = await supabase
      .from('mock_test_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('mock_test_id', test.id)
      .eq('status', 'started')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existing) {
      navigate(`/practice?mock=${test.id}&attempt=${existing.id}`)
      return
    }
    const { data, error: insErr } = await supabase
      .from('mock_test_attempts')
      .insert({ user_id: user.id, mock_test_id: test.id, total_count: test.num_questions })
      .select('id')
      .single()
    if (insErr) { setError(insErr); return }
    navigate(`/practice?mock=${test.id}&attempt=${data.id}`)
  }

  function handleReview(test) {
    navigate(`/tests/${test.id}/review`)
  }

  function handleCustom() {
    navigate('/tests/custom')
  }

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <div className="editorial-tag">
          <div className="line" />
          <span>Simulated Exams</span>
        </div>
        <h1 className="page-title">Mock Tests</h1>
        <p className="page-sub">Standardized simulations for JEE & NEET preparation.</p>
      </header>

      <div className="row mb-24 flex-wrap gap-8">
        {['all', 'upcoming', 'completed'].map(f => (
          <button
            key={f}
            className={`filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            style={{ fontSize: 11, padding: '4px 12px' }}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="spacer" />
        <button
          className="btn-primary"
          style={{ padding: '6px 12px', borderRadius: 8 }}
          onClick={handleCustom}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          Custom Test
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: 13, marginBottom: 16 }}>
          Couldn't load tests: {error.message}
        </div>
      )}

      {loading ? (
        <div className="text-muted text-sm">Loading tests…</div>
      ) : shown.length === 0 ? (
        <div className="text-muted text-sm" style={{ padding: 32, textAlign: 'center' }}>
          {filter === 'completed' ? 'No completed tests yet.' : 'No tests available.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {shown.map(test => (
            <div key={test.id} className="glass-card test-row">
              <div className="test-icon-box" style={{ background: test.score == null ? 'rgba(231,249,92,0.06)' : 'rgba(255,255,255,0.03)' }}>
                <span className="material-symbols-outlined" style={{ color: test.score == null ? 'var(--primary)' : 'var(--muted)', fontSize: 20 }}>
                  {test.score == null ? 'quiz' : 'task_alt'}
                </span>
              </div>

              <div className="flex-1">
                <div className="text-bold mb-4" style={{ fontFamily: 'var(--fh)', fontSize: 14 }}>{test.title}</div>
                <div className="row gap-8 flex-wrap">
                  <span className="text-micro">{test.pattern}</span>
                  <span className="text-muted" style={{ fontSize: 10 }}>·</span>
                  <span className="text-micro">{test.num_questions} Qs</span>
                  <span className="text-muted" style={{ fontSize: 10 }}>·</span>
                  <span className="text-micro">{formatDuration(test.duration_minutes)}</span>
                  <span className="text-muted" style={{ fontSize: 10 }}>·</span>
                  <span style={{ fontSize: 10, color: diffColor[test.difficulty], fontWeight: 700, textTransform: 'uppercase' }}>{test.difficulty}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                {test.score != null ? (
                  <div>
                    <div className="text-black mb-4" style={{ fontFamily: 'var(--fh)', fontSize: 24, letterSpacing: '-0.02em', color: test.score >= 70 ? 'var(--primary)' : 'var(--error)' }}>
                      {test.score}%
                    </div>
                    <button
                      className="btn-outline text-micro"
                      style={{ padding: '4px 10px' }}
                      onClick={() => handleReview(test)}
                    >
                      Review
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-start"
                    style={{ padding: '6px 12px', fontSize: 11 }}
                    onClick={() => handleStart(test)}
                  >
                    {test.inProgress ? 'Resume' : 'Start'}
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
