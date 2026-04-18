import { useMemo } from 'react'

const insights = [
  { type: 'primary', icon: 'bolt', title: 'Rotational Dynamics', body: 'Performance has plateaued over the last 3 tests. Revisit Moment of Inertia derivations for deeper understanding.' },
  { type: 'error', icon: 'warning', title: 'Late-test accuracy drop', body: 'Accuracy drops 14% after the 2-hour mark. Try timed sprints to build exam stamina.' },
]

function HeatmapGrid() {
  const cells = useMemo(() => {
    return Array.from({ length: 364 }, (_, i) => {
      const r = Math.random()
      let bg = '#18181b'
      if (r > 0.85) bg = 'var(--primary)'
      else if (r > 0.6) bg = 'rgba(231,249,92,0.4)'
      return bg
    })
  }, [])

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gridAutoFlow: 'column', gap: 4, width: 'max-content' }}>
        {cells.map((bg, i) => (
          <div key={i} className="heatmap-cell" style={{ background: bg }} />
        ))}
      </div>
    </div>
  )
}

export default function Analytics() {
  return (
    <div className="page-canvas">
      <header style={{ marginBottom: 40 }}>
        <h1 className="page-title">Analysis</h1>
        <p className="page-sub">Detailed breakdown of your performance across subjects, speed, and consistency.</p>
      </header>

      <div className="bento-2" style={{ marginBottom: 24 }}>
        <div className="section-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="row" style={{ marginBottom: 32 }}>
            <h3 className="section-label" style={{ flex: 1 }}>Skill Breakdown</h3>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>analytics</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
            <svg width="240" height="240" viewBox="0 0 200 200" style={{ filter: 'drop-shadow(0 0 15px rgba(231,249,92,0.15))' }}>
              <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="var(--outline-v)" strokeWidth="0.5" strokeDasharray="2 2" />
              <polygon points="100,50 150,100 100,150 50,100" fill="none" stroke="var(--outline-v)" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="2" fill="var(--outline-v)" />
              <polygon points="100,40 160,110 110,160 40,90" fill="rgba(231,249,92,0.15)" stroke="#e7f95c" strokeWidth="2" />
              <text x="100" y="15" fill="var(--on-sv)" fontSize="8" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700">ACCURACY</text>
              <text x="195" y="103" fill="var(--on-sv)" fontSize="8" textAnchor="start" fontFamily="Space Grotesk" fontWeight="700">SPEED</text>
              <text x="100" y="195" fill="var(--on-sv)" fontSize="8" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700">MEMORY</text>
              <text x="5" y="103" fill="var(--on-sv)" fontSize="8" textAnchor="end" fontFamily="Space Grotesk" fontWeight="700">LOGIC</text>
            </svg>
          </div>
          <div className="row" style={{ justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, marginTop: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <p className="text-sm">Percentile</p>
              <p style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 28, color: 'var(--primary)' }}>98.4</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="text-sm">Rank Estimate</p>
              <p style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 28 }}>#1,242</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--sc-high)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="section-label" style={{ marginBottom: 16 }}>Subject Split</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '16px 0', flex: 1 }}>
            <div style={{ position: 'relative', width: 160, height: 160 }}>
              <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--sc-bright)" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--primary)" strokeWidth="12" strokeDasharray="440" strokeDashoffset="110" />
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--tertiary)" strokeWidth="12" strokeDasharray="440" strokeDashoffset="330" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 28 }}>74%</span>
                <span className="text-micro">Mastered</span>
              </div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { color: 'var(--primary)', label: 'Physics', pct: '42%' },
                { color: 'var(--tertiary)', label: 'Chemistry', pct: '31%' },
                { color: 'rgba(255,255,255,0.2)', label: 'Mathematics', pct: '27%' },
              ].map(item => (
                <li key={item.label} className="row" style={{ gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: 'var(--fh)', fontSize: 11, fontWeight: 700 }}>{item.label}</p>
                    <p className="text-micro">{item.pct}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="section-panel" style={{ marginBottom: 24 }}>
        <div className="row" style={{ marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <h3 className="section-label">Consistency</h3>
            <p className="text-sm" style={{ marginTop: 4 }}>112 day streak</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="text-micro">Less</span>
            {['#18181b', 'rgba(231,249,92,0.2)', 'rgba(231,249,92,0.5)', '#e7f95c'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
            ))}
            <span className="text-micro">More</span>
          </div>
        </div>
        <HeatmapGrid />
      </div>

      <div className="bento-2">
        <div className="section-panel">
          <div className="row" style={{ marginBottom: 32 }}>
            <h3 className="section-label" style={{ flex: 1 }}>Accuracy Trend</h3>
            <div className="row" style={{ gap: 16 }}>
              <span className="row" style={{ gap: 4, fontSize: 11, fontFamily: 'var(--fh)', fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} /> Mocks
              </span>
              <span className="row" style={{ gap: 4, fontSize: 11, fontFamily: 'var(--fh)', fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--error)', display: 'inline-block' }} /> Errors
              </span>
            </div>
          </div>
          <div style={{ position: 'relative', height: 180 }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="accGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e7f95c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e7f95c" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,150 Q150,140 250,110 T500,130 T750,60 T1000,80 V200 H0 Z" fill="url(#accGrad)" />
              <path d="M0,150 Q150,140 250,110 T500,130 T750,60 T1000,80" fill="none" stroke="#e7f95c" strokeWidth="4" strokeLinecap="round" />
              <path d="M0,180 Q100,170 300,185 T600,170 T900,190 T1000,185" fill="none" stroke="#ff7351" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
            <div style={{ position: 'absolute', top: 8, right: '25%', padding: '8px 12px', background: 'var(--sc-bright)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, backdropFilter: 'blur(8px)' }}>
              <p className="text-micro" style={{ letterSpacing: '0.1em' }}>Current Peak</p>
              <p style={{ fontFamily: 'var(--fh)', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>94.2%</p>
            </div>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
            {['Jan','Feb','Mar','Apr','May','Jun'].map(m => <span key={m} className="text-micro">{m}</span>)}
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, var(--sc-high), var(--sc-low))', borderRadius: 16, padding: 32, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(231,249,92,0.1)', filter: 'blur(60px)', borderRadius: '50%' }} />
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 16 }}>timer</span>
          <p className="section-label" style={{ marginBottom: 8, fontSize: 12 }}>Speed</p>
          <div className="row" style={{ alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em' }}>1.8</span>
            <span style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>min/q</span>
          </div>
          <p className="text-sm" style={{ lineHeight: 1.6, maxWidth: 260 }}>
            <strong style={{ color: '#fff' }}>12% faster</strong> than the top-500 cohort average.
          </p>
          <div className="neon-progress-track" style={{ marginTop: 24, width: '100%' }}>
            <div className="neon-progress-fill" style={{ width: '88%' }} />
          </div>
        </div>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 24, letterSpacing: '-0.02em', marginBottom: 32 }}>
          Insights
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {insights.map(item => (
            <div key={item.title} className={`insight-card ${item.type}`}>
              <span className="material-symbols-outlined" style={{ color: item.type === 'primary' ? 'var(--primary)' : 'var(--error)', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <h4 style={{ fontFamily: 'var(--fh)', fontWeight: 700, color: '#fff', marginBottom: 6 }}>{item.title}</h4>
                <p className="text-sm" style={{ lineHeight: 1.6 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
