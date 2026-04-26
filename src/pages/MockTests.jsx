import { useState } from 'react'

const tests = [
  { id: 1, title: 'Full Length Mock #8', type: 'JEE Main Pattern', qs: 90, dur: '3 hrs', diff: 'Hard', score: null },
  { id: 2, title: 'Physics — EM Induction', type: 'Chapter Test', qs: 30, dur: '45 min', diff: 'Medium', score: 74 },
  { id: 3, title: 'Chemistry — Organic Part 2', type: 'Chapter Test', qs: 40, dur: '60 min', diff: 'Hard', score: 58 },
  { id: 4, title: 'Full Length Mock #7', type: 'JEE Advanced Pattern', qs: 54, dur: '3 hrs', diff: 'Hard', score: 83 },
  { id: 5, title: 'Math — Calculus Intensive', type: 'Topic Drill', qs: 50, dur: '75 min', diff: 'Medium', score: null },
]

const diffColor = { Hard: 'var(--error)', Medium: '#f4a261', Easy: 'var(--primary)' }

export default function MockTests() {
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? tests : tests.filter(t => filter === 'upcoming' ? !t.score : t.score)

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
        <button className="btn-primary" style={{ padding: '6px 12px', borderRadius: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          Custom Test
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {shown.map(test => (
          <div key={test.id} className="glass-card test-row">
            <div className="test-icon-box" style={{ background: !test.score ? 'rgba(231,249,92,0.06)' : 'rgba(255,255,255,0.03)' }}>
              <span className="material-symbols-outlined" style={{ color: !test.score ? 'var(--primary)' : 'var(--muted)', fontSize: 20 }}>
                {!test.score ? 'quiz' : 'task_alt'}
              </span>
            </div>

            <div className="flex-1">
              <div className="text-bold mb-4" style={{ fontFamily: 'var(--fh)', fontSize: 14 }}>{test.title}</div>
              <div className="row gap-8 flex-wrap">
                <span className="text-micro">{test.type}</span>
                <span className="text-muted" style={{ fontSize: 10 }}>·</span>
                <span className="text-micro">{test.qs} Qs</span>
                <span className="text-muted" style={{ fontSize: 10 }}>·</span>
                <span className="text-micro">{test.dur}</span>
                <span className="text-muted" style={{ fontSize: 10 }}>·</span>
                <span style={{ fontSize: 10, color: diffColor[test.diff], fontWeight: 700, textTransform: 'uppercase' }}>{test.diff}</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              {test.score ? (
                <div>
                  <div className="text-black mb-4" style={{ fontFamily: 'var(--fh)', fontSize: 24, letterSpacing: '-0.02em', color: test.score >= 70 ? 'var(--primary)' : 'var(--error)' }}>
                    {test.score}%
                  </div>
                  <button className="btn-outline text-micro" style={{ padding: '4px 10px' }}>Review</button>
                </div>
              ) : (
                <button className="btn-start" style={{ padding: '6px 12px', fontSize: 11 }}>
                  Start <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
