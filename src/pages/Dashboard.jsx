import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '../hooks/useUserStats'
import { slugToTitle } from '../lib/slug'

const SUBJECT_ICON = { Physics: 'bolt', Mathematics: 'functions', Chemistry: 'science' }

function StatCard({ stat }) {
  return (
    <div className="glass-card stat-card">
      <div className="stat-card-glow" />
      <span className="stat-label">{stat.label}</span>
      <div className="row" style={{ alignItems: 'flex-end', gap: 0, position: 'relative', zIndex: 1 }}>
        <span className="stat-value" style={stat.primary ? { color: 'var(--primary)' } : undefined}>
          {stat.value}
        </span>
        {stat.suffix && (
          <span className="stat-suffix" style={stat.primary ? { color: 'var(--primary)' } : undefined}>
            {stat.suffix}
          </span>
        )}
        {stat.delta && <span className={`stat-delta ${stat.up ? 'up' : 'down'}`}>{stat.delta}</span>}
      </div>
    </div>
  )
}

function WeeklyChart({ weekly }) {
  const max = Math.max(1, ...weekly.map(d => d.count))
  const points = weekly.map((d, i) => {
    const x = (i / (weekly.length - 1)) * 400
    const y = 100 - (d.count / max) * 80
    return [x, y]
  })
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const area = `${path} L400,100 L0,100 Z`
  const peakIdx = weekly.reduce((acc, d, i) => d.count > weekly[acc].count ? i : acc, 0)
  const dayLabels = weekly.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }))

  return (
    <>
      <svg width="100%" height="180" viewBox="-10 0 420 100" className="chart-svg overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#chartGrad)" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between mt-16 px-8">
        {dayLabels.map((d, i) => (
          <span key={i} className={`text-micro ${i === peakIdx ? 'text-primary' : ''}`}>{d}</span>
        ))}
      </div>
    </>
  )
}

function todaysPlan({ inProgressMock, weakTopics, resume }) {
  const items = []
  if (inProgressMock) {
    items.push({
      kind: 'mock',
      title: inProgressMock.mock_tests?.title || 'Resume Mock Test',
      meta: `${inProgressMock.mock_tests?.duration_minutes || 60} min · ${inProgressMock.mock_tests?.pattern || 'Mock'}`,
      time: 'Now',
      primary: true,
      onClick: nav => nav(`/practice?mock=${inProgressMock.mock_test_id}`),
    })
  }
  for (const w of weakTopics.slice(0, 2)) {
    items.push({
      kind: 'drill',
      title: `Drill: ${slugToTitle(w.topic)}`,
      meta: `${w.subject} · accuracy ${Math.round(w.accuracy * 100)}%`,
      time: '15 min',
      primary: items.length === 0,
      onClick: nav => nav(`/practice?subject=${encodeURIComponent(w.subject)}&chapter=${encodeURIComponent(w.chapter)}&topic=${encodeURIComponent(w.topic)}`),
    })
  }
  if (resume && items.length < 3) {
    items.push({
      kind: 'pyq',
      title: `PYQ: ${slugToTitle(resume.topic)}`,
      meta: `${resume.subject} · continue`,
      time: '20 min',
      primary: false,
      onClick: nav => nav(`/practice?subject=${encodeURIComponent(resume.subject)}&chapter=${encodeURIComponent(resume.chapter)}&topic=${encodeURIComponent(resume.topic)}`),
    })
  }
  return items
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { totals, weekly, weekDelta, weakTopics, resume, inProgressMock, loading } = useDashboardStats()

  const accuracy = totals.solved > 0 ? (totals.correct / totals.solved) * 100 : 0
  const avgTimeSec = totals.solved > 0 ? Math.round(totals.totalTimeMs / totals.solved / 1000) : 0
  const stats = [
    {
      label: 'Total Solved',
      value: totals.solved.toLocaleString(),
      delta: totals.solved > 0
        ? `${weekDelta >= 0 ? '+' : ''}${weekDelta}% vs last week`
        : 'Start practicing',
      up: weekDelta >= 0,
    },
    {
      label: 'Accuracy',
      value: totals.solved > 0 ? accuracy.toFixed(1) : '—',
      suffix: totals.solved > 0 ? '%' : '',
      primary: true,
    },
    {
      label: 'Avg Time / Q',
      value: avgTimeSec > 0 ? avgTimeSec : '—',
      suffix: avgTimeSec > 0 ? 's' : '',
    },
  ]

  const plan = todaysPlan({ inProgressMock, weakTopics, resume })
  const today = new Date()
  const dateNum = today.getDate()
  const monthLabel = today.toLocaleDateString('en-US', { month: 'short' })

  function continueResume() {
    if (resume) {
      navigate(`/practice?subject=${encodeURIComponent(resume.subject)}&chapter=${encodeURIComponent(resume.chapter)}&topic=${encodeURIComponent(resume.topic)}`)
    } else {
      navigate('/subjects')
    }
  }

  function drill(w) {
    navigate(`/practice?subject=${encodeURIComponent(w.subject)}&chapter=${encodeURIComponent(w.chapter)}&topic=${encodeURIComponent(w.topic)}`)
  }

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <div className="editorial-tag">
          <div className="line" />
          <span>Performance Overview</span>
        </div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Comprehensive overview of your JEE preparation performance.</p>
      </header>

      <div className="bento-3">
        {stats.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      <div className="bento-5">
        <div className="glass-card editorial-card" style={{ overflow: 'visible' }}>
          <h3 className="section-title">Weekly Progress</h3>
          <p className="text-micro mb-24">Questions solved per day</p>
          <WeeklyChart weekly={weekly.length ? weekly : Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - (6 - i) * 86400000).toISOString(), count: 0 }))} />
        </div>

        <div className="glass-card editorial-card dashboard-resume-card">
          <div className="dashboard-resume-icon">
            <span className="material-symbols-outlined">{resume ? 'play_arrow' : 'explore'}</span>
          </div>
          <div>
            <span className="badge-resume">{resume ? 'Resume' : 'Get Started'}</span>
            <h2 className="dashboard-resume-title">
              {resume ? slugToTitle(resume.topic) : 'Pick a subject'}
            </h2>
            <p className="text-sm" style={{ marginTop: 6 }}>
              {resume ? `${resume.subject} · ${slugToTitle(resume.chapter)}` : 'Start with PYQs from any subject'}
            </p>
          </div>
          <button className="submit-btn dashboard-resume-action" onClick={continueResume}>
            {resume ? 'Continue' : 'Browse'}
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
          </button>
        </div>
      </div>

      <div className="bento-2">
        <div className="glass-card editorial-card">
          <div className="row mb-12">
            <h3 className="section-title flex-1">Weak Topics</h3>
            {weakTopics.length > 0 && <span className="text-error text-micro">{weakTopics.length} Flagged</span>}
          </div>
          <div className="flex-col gap-12">
            {loading ? (
              <div className="text-micro text-muted">Loading…</div>
            ) : weakTopics.length === 0 ? (
              <div className="text-micro text-muted" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>
                No weak topics yet — solve at least 5 questions in a topic to see analysis here.
              </div>
            ) : weakTopics.map(w => (
              <div key={`${w.subject}-${w.topic}`} className="weakness-row">
                <div className="row">
                  <div className="weakness-icon">
                    <span className="material-symbols-outlined">{SUBJECT_ICON[w.subject] || 'psychology'}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{slugToTitle(w.topic)}</div>
                    <div className="text-sm" style={{ marginTop: 2 }}>
                      Accuracy: {Math.round(w.accuracy * 100)}% · Avg time: {Math.round(w.avgTimeSec)}s
                    </div>
                  </div>
                </div>
                <button className="btn-ghost" onClick={() => drill(w)}>Drill</button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card editorial-card">
          <div className="row mb-12">
            <h3 className="section-title flex-1">Today's Plan</h3>
            {plan.length > 0 && <span className="text-micro text-primary">Next Up</span>}
          </div>
          <div className="row items-start gap-24">
            <div className="text-center flex-shrink-0" style={{ paddingTop: 8 }}>
              <div className="text-primary text-black" style={{ fontFamily: 'var(--fh)', fontSize: 28, lineHeight: 1 }}>{dateNum}</div>
              <div className="text-micro mt-4">{monthLabel}</div>
            </div>
            <div style={{ flex: 1 }}>
              {plan.length === 0 ? (
                <div className="text-micro text-muted" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>
                  Nothing on the plan. Pick a subject to start practicing.
                </div>
              ) : plan.map((s, i) => (
                <button
                  key={i}
                  onClick={() => s.onClick(navigate)}
                  className={`weakness-row dashboard-plan-row ${s.primary ? 'active' : ''}`}
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: i === plan.length - 1 ? 0 : 12 }}
                >
                  <div className="row" style={{ flex: 1, minWidth: 0 }}>
                    <div className="dashboard-plan-icon">
                      <span className="material-symbols-outlined">
                        {s.kind === 'drill' ? 'fitness_center' : s.kind === 'mock' ? 'quiz' : 'menu_book'}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="text-bold" style={{ fontSize: 13 }}>{s.title}</div>
                      <div className="text-micro text-on-sv" style={{ marginTop: 4 }}>{s.meta}</div>
                    </div>
                  </div>
                  <div className="text-micro text-muted">{s.time}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
