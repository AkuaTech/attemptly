import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function TestHistory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('mock_test_attempts')
        .select('id, mock_test_id, score, correct_count, total_count, time_spent_ms, completed_at, mock_tests(title, pattern)')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
      if (cancelled) return
      if (err) { setError(err); setLoading(false); return }
      setAttempts(data || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <div className="editorial-tag">
          <div className="line" />
          <span>Performance Log</span>
        </div>
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
        <div className="text-muted text-sm">Loading history…</div>
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
                <div className="test-icon-box" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--muted)', fontSize: 20 }}>history</span>
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
