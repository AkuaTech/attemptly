import { ArrowLeft, ClockCounterClockwise } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import { SkeletonTestRow } from '../components/Skeleton'
import { cacheGet, cacheSet, cacheIsStale } from '../lib/cache'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function TestHistory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const cacheKey = user ? `test_history_${user.id}` : null
  const cached = cacheKey ? cacheGet(cacheKey) : null
  const [attempts, setAttempts] = useState(cached || [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || !cacheKey) { setLoading(false); return }
    if (cached && !cacheIsStale(cacheKey)) return
    
    let cancelled = false
    async function load() {
      const { data, error: err } = await supabase
        .from('mock_test_attempts')
        .select('id, mock_test_id, score, correct_count, total_count, time_spent_ms, completed_at, mock_tests(title, pattern)')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
      if (cancelled) return
      if (err) { setError(err); setLoading(false); return }
      const result = data || []
      cacheSet(cacheKey, result)
      setAttempts(result)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user, cacheKey, cached])

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <button
          className="btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px', marginBottom: 20 }}
          onClick={() => navigate('/tests')}
        >
          <ArrowLeft size={16} />
          Tests
        </button>
        <h1 className="page-title">Test History</h1>
        <p className="page-sub">Every completed test, with its full performance breakdown.</p>
      </header>

      <div className="row mb-24 flex-wrap gap-8">
        <button className="filter-pill" style={{ fontSize: 11, padding: '4px 12px' }} onClick={() => navigate('/tests')}>
          Browse
        </button>
        <button className="filter-pill active" style={{ fontSize: 11, padding: '4px 12px' }}>
          History
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: 13, marginBottom: 16 }}>
          Couldn't load history: {error.message}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkeletonTestRow />
          <SkeletonTestRow />
          <SkeletonTestRow />
        </div>
      ) : attempts.length === 0 ? (
        <div className="text-muted text-sm" style={{ padding: 32, textAlign: 'center' }}>
          No completed tests yet. Finish a mock test to see it here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {attempts.map(a => {
            const score = Math.round(Number(a.score) || 0)
            return (
              <button
                key={a.id}
                className="glass-card test-row"
                style={{ textAlign: 'left', cursor: 'pointer' }}
                onClick={() => navigate(`/tests/result/${a.id}`)}
              >
                <div className="test-icon-box" style={{ background: 'var(--fill-faint)' }}>
                  <ClockCounterClockwise size={20} color="var(--muted)" />
                </div>

                <div className="flex-1">
                  <div className="text-bold mb-4" style={{ fontFamily: 'var(--fh)', fontSize: 14 }}>
                    {a.mock_tests?.title || 'Test'}
                  </div>
                  <div className="row gap-8 flex-wrap">
                    <span className="text-micro">{formatDate(a.completed_at)}</span>
                    <span className="text-muted" style={{ fontSize: 10 }}>·</span>
                    <span className="text-micro">{a.correct_count ?? 0}/{a.total_count ?? 0} correct</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-black mb-4" style={{ fontFamily: 'var(--fh)', fontSize: 24, letterSpacing: '-0.02em', color: score >= 70 ? 'var(--primary)' : 'var(--error)' }}>
                    {score}%
                  </div>
                  <span className="btn-outline text-micro" style={{ padding: '4px 10px', display: 'inline-block' }}>
                    View Analysis
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
