import { ArrowRight, Plus, X, Exam, CheckCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import { displayDifficulty } from '../lib/mockContract'
import { SkeletonTestRow } from '../components/Skeleton'
import { cacheGet, cacheSet, cacheIsStale } from '../lib/cache'

const diffColor = { hard: 'var(--error)', medium: '#f4a261', easy: 'var(--primary)' }

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
  const cacheKey = user ? `mock_tests_${user.id}` : 'mock_tests_public'
  const cached = cacheGet(cacheKey)
  const [tests, setTests] = useState(cached || [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState(null)
  const [confirmTest, setConfirmTest] = useState(null)

  useEffect(() => {
    if (cached && !cacheIsStale(cacheKey)) return
    
    let cancelled = false
    async function load() {
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
      cacheSet(cacheKey, enriched)
      setTests(enriched)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user, cacheKey, cached])

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
    setConfirmTest(test)
  }

  async function confirmStart() {
    if (!confirmTest) return
    const test = confirmTest
    setConfirmTest(null)
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
        <h1 className="page-title">Mock Tests</h1>
      <p className="page-sub">Build focused practice tests from the question bank.</p>
      </header>

      <div className="row mb-16 flex-wrap gap-8 tests-view-tabs">
        <button className="filter-pill active" style={{ fontSize: 11, padding: '4px 12px' }}>
          Browse
        </button>
        <button
          className="filter-pill"
          style={{ fontSize: 11, padding: '4px 12px' }}
          onClick={() => navigate('/tests/history')}
        >
          History
        </button>
      </div>

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
          <Plus size={14} />
          Custom Test
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: 13, marginBottom: 16 }}>
          Couldn't load tests: {error.message}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkeletonTestRow />
          <SkeletonTestRow />
          <SkeletonTestRow />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-muted text-sm" style={{ padding: 32, textAlign: 'center' }}>
          {filter === 'completed' ? 'No completed tests yet.' : 'No custom tests yet. Create one to get started.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map(test => (
            <div key={test.id} className="glass-card glass-card-hover test-row" onClick={() => test.score == null ? handleStart(test) : handleReview(test)}>
              <div className="test-row-icon" style={{ background: test.score == null ? 'rgba(231,249,92,0.08)' : 'var(--fill-faint)' }}>
                {test.score == null
                  ? <Exam size={22} color="var(--primary)" />
                  : <CheckCircle size={22} color="var(--muted)" />}
              </div>

              <div className="test-row-body">
                <div className="test-title">{test.title}</div>
                <div className="test-row-chips">
                  <span className="chip" style={{ fontSize: 9 }}>{test.pattern}</span>
                  <span className="chip" style={{ fontSize: 9 }}>{test.num_questions} Qs</span>
                  <span className="chip" style={{ fontSize: 9 }}>{formatDuration(test.duration_minutes)}</span>
                  <span className="chip" style={{ fontSize: 9, background: diffColor[String(test.difficulty).toLowerCase()] + '15', color: diffColor[String(test.difficulty).toLowerCase()], borderColor: diffColor[String(test.difficulty).toLowerCase()] + '30' }}>{displayDifficulty(test.difficulty)}</span>
                </div>
              </div>

              <div className="test-row-actions">
                {test.score != null ? (
                  <>
                    <div className="text-black" style={{ fontFamily: 'var(--fh)', fontSize: 28, letterSpacing: '-0.02em', color: test.score >= 70 ? 'var(--primary)' : 'var(--error)', lineHeight: 1 }}>
                      {test.score}<span style={{ fontSize: 14 }}>%</span>
                    </div>
                    <div className="test-row-links">
                      <button className="btn-outline" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8 }} onClick={e => { e.stopPropagation(); handleReview(test); }}>Review</button>
                      <button className="btn-start" style={{ padding: '6px 14px', fontSize: 12 }} onClick={e => { e.stopPropagation(); handleStart(test); }}>Retake</button>
                    </div>
                  </>
                ) : (
                  <button className="btn-start" style={{ padding: '8px 16px', fontSize: 12, whiteSpace: 'nowrap' }} onClick={e => { e.stopPropagation(); handleStart(test); }}>
                    {test.inProgress ? 'Resume' : 'Start'}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmTest && (
        <div className="modal-backdrop" onClick={() => setConfirmTest(null)}>
          <div className="modal-card" style={{ maxWidth: 400 }}>
            <div className="modal-head">
              <h3 className="modal-title">Start Test?</h3>
              <button className="modal-close" onClick={() => setConfirmTest(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm" style={{ margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to start <strong>{confirmTest.title}</strong>? This will begin a timed session.
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setConfirmTest(null)}>Cancel</button>
              <button className="btn-start" onClick={confirmStart}>Start Test</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
