import { Barbell, Play, CheckCircle, Exam } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useUserStats'
import { slugToTitle } from '../lib/slug'
import { SkeletonRow, SkeletonTestRow } from '../components/Skeleton'
import { cacheGet, cacheSet, cacheIsStale } from '../lib/cache'

export default function Schedule() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { weakTopics, resume, loading: statsLoading } = useDashboardStats()
  const cacheKey = user ? `schedule_mocks_${user.id}` : null
  const cached = cacheKey ? cacheGet(cacheKey) : null
  const [recentMocks, setRecentMocks] = useState(cached || [])
  const [recentLoading, setRecentLoading] = useState(!cached)

  useEffect(() => {
    if (!user || !cacheKey) { setRecentLoading(false); return }
    if (cached && !cacheIsStale(cacheKey)) return
    
    let cancelled = false
    supabase
      .from('mock_test_attempts')
      .select('id, mock_test_id, status, started_at, score, mock_tests(title, pattern, num_questions, duration_minutes)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (cancelled) return
        const result = data || []
        cacheSet(cacheKey, result)
        setRecentMocks(result)
        setRecentLoading(false)
      })
    return () => { cancelled = true }
  }, [user, cacheKey, cached])

  const today = new Date()
  const items = []
  if (resume) {
    items.push({
      kind: 'resume',
      title: `Continue ${slugToTitle(resume.topic)}`,
      meta: `${resume.subject} · ${slugToTitle(resume.chapter)}`,
      cta: 'Continue',
      onClick: () => navigate(`/practice?subject=${encodeURIComponent(resume.subject)}&chapter=${encodeURIComponent(resume.chapter)}&topic=${encodeURIComponent(resume.topic)}`),
    })
  }
  for (const w of weakTopics.slice(0, 3)) {
    items.push({
      kind: 'drill',
      title: `Drill: ${slugToTitle(w.topic)}`,
      meta: `${w.subject} · accuracy ${Math.round(w.accuracy * 100)}%`,
      cta: 'Drill',
      onClick: () => navigate(`/practice?subject=${encodeURIComponent(w.subject)}&chapter=${encodeURIComponent(w.chapter)}&topic=${encodeURIComponent(w.topic)}`),
    })
  }

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <h1 className="page-title">Schedule</h1>
        <p className="page-sub">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Picks your weakest topics based on accuracy
        </p>
      </header>

      <div className="bento-2">
        <div className="glass-card editorial-card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Recommended for today</h3>
          {statsLoading ? (
            <div className="flex-col gap-12">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : items.length === 0 ? (
            <div>
              <p className="text-sm" style={{ color: 'var(--on-sv)', marginBottom: 16 }}>
                Nothing scheduled. Pick a subject and start practicing — the planner will fill out as you go.
              </p>
              <button className="btn-outline" style={{ padding: '10px 16px', borderRadius: 10 }} onClick={() => navigate('/subjects')}>
                Browse Subjects
              </button>
            </div>
          ) : (
            <div className="flex-col gap-12">
              {items.map((it, i) => (
                <button
                  key={i}
                  onClick={it.onClick}
                  className="weakness-row"
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                  <div className="row" style={{ flex: 1, minWidth: 0 }}>
                    <div className={`schedule-plan-icon ${it.kind === 'drill' ? 'drill' : 'resume'}`}>
                      {it.kind === 'drill' ? <Barbell size={16} /> : <Play size={16} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{it.title}</div>
                      <div className="text-sm" style={{ marginTop: 2 }}>{it.meta}</div>
                    </div>
                  </div>
                  <span className="btn-ghost">{it.cta}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card editorial-card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Recent Mock Tests</h3>
          {recentLoading ? (
            <div className="flex-col gap-12">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : recentMocks.length === 0 ? (
            <div>
              <p className="text-sm" style={{ color: 'var(--on-sv)', marginBottom: 16 }}>
                No mock tests yet.
              </p>
              <button className="btn-outline" style={{ padding: '10px 16px', borderRadius: 10 }} onClick={() => navigate('/tests')}>
                Browse Mock Tests
              </button>
            </div>
          ) : (
            <div className="flex-col gap-12">
              {recentMocks.map(a => (
                <div key={a.id} className="weakness-row">
                  <div className="row" style={{ flex: 1, minWidth: 0 }}>
                    <div className={`schedule-mock-icon ${a.status === 'completed' ? 'completed' : 'active'}`}>
                      {a.status === 'completed' ? <CheckCircle size={16} /> : <Exam size={16} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{a.mock_tests?.title || 'Mock Test'}</div>
                      <div className="text-sm" style={{ marginTop: 2 }}>
                        {new Date(a.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {a.status === 'completed' && a.score != null && ` · ${Math.round(Number(a.score))}%`}
                        {a.status === 'started' && ' · in progress'}
                      </div>
                    </div>
                  </div>
                  <button className="btn-ghost" onClick={() => navigate(a.status === 'completed' ? `/tests/${a.mock_test_id}/review` : `/practice?mock=${a.mock_test_id}&attempt=${a.id}`)}>
                    {a.status === 'completed' ? 'Review' : 'Resume'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
