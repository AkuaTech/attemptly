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
      <header style={{ marginBottom: 40 }}>
        <h1 className="page-title">Mock Tests</h1>
        <p className="page-sub">Full-length simulations and chapter tests for JEE / NEET.</p>
      </header>

      <div className="row" style={{ marginBottom: 32 }}>
        {['all', 'upcoming', 'completed'].map(f => (
          <button
            key={f}
            className={`filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="spacer" />
        <button className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Custom Test
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {shown.map(test => (
          <div key={test.id} className="glass-card test-row">
            <div className="test-icon-box" style={{ background: !test.score ? 'rgba(231,249,92,0.08)' : 'rgba(72,72,71,0.25)' }}>
              <span className="material-symbols-outlined" style={{ color: !test.score ? 'var(--primary)' : 'var(--on-sv)', fontSize: 22 }}>
                {!test.score ? 'quiz' : 'task_alt'}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{test.title}</div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className="text-sm">{test.type}</span>
                <span style={{ color: 'var(--outline)', fontSize: 12 }}>·</span>
                <span className="text-sm">{test.qs} Questions</span>
                <span style={{ color: 'var(--outline)', fontSize: 12 }}>·</span>
                <span className="text-sm">{test.dur}</span>
                <span style={{ color: 'var(--outline)', fontSize: 12 }}>·</span>
                <span style={{ fontSize: 12, color: diffColor[test.diff], fontWeight: 600 }}>{test.diff}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {test.score ? (
                <div>
                  <div style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 30, letterSpacing: '-0.04em', color: test.score >= 70 ? 'var(--primary)' : 'var(--error)' }}>
                    {test.score}%
                  </div>
                  <button className="btn-outline" style={{ marginTop: 6 }}>Review</button>
                </div>
              ) : (
                <button className="btn-start">
                  Start <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
