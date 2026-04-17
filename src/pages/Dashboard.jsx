import { useState } from 'react'

const weaknesses = [
  { icon: 'psychology', topic: 'Thermodynamics', meta: 'Accuracy: 42% · Avg time: 110s' },
  { icon: 'functions', topic: 'Integral Calculus', meta: 'Accuracy: 51% · Avg time: 95s' },
  { icon: 'science', topic: 'Organic Synthesis', meta: 'Accuracy: 55% · Avg time: 88s' },
]

const schedule = [
  { time: '09:00 AM', title: 'Full Length Mock #8', meta: '3 Hours · JEE Main Pattern', primary: true },
  { time: '02:30 PM', title: 'Revision Session', meta: 'Thermodynamics weak topics', primary: false },
  { time: '05:00 PM', title: 'PYQ Practice', meta: '45 questions · Vector Algebra', primary: false },
]

const stats = [
  { label: 'Total Solved', value: '3,492', delta: '+12% vs last week', up: true },
  { label: 'Accuracy', value: '88.4', suffix: '%', primary: true },
  { label: 'Avg Time / Q', value: '42', suffix: 's', delta: 'Slowing down', up: false },
]

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

export default function Dashboard() {
  return (
    <div className="page-canvas">
      <header style={{ marginBottom: 40 }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Here's how you're doing across 1,240 questions this month.</p>
      </header>

      <div className="bento-3">
        {stats.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      <div className="bento-5">
        <div className="glass-card" style={{ padding: 32 }}>
          <h3 className="section-title" style={{ marginBottom: 4 }}>Weekly Progress</h3>
          <p className="text-sm" style={{ marginBottom: 32 }}>Based on daily questions solved.</p>

          <svg width="100%" height="180" viewBox="0 0 400 100" style={{ filter: 'drop-shadow(0 0 15px rgba(231,249,92,0.5))' }}>
            <defs>
              <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e7f95c" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#e7f95c" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,80 Q50,90 80,60 T150,40 T220,70 T300,20 T400,35 L400,100 L0,100 Z" fill="url(#chartGrad)" />
            <path d="M0,80 Q50,90 80,60 T150,40 T220,70 T300,20 T400,35" fill="none" stroke="#e7f95c" strokeWidth="4" strokeLinecap="round" />
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '0 8px' }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
              <span key={d} className="text-micro" style={i === 5 ? { color: 'var(--primary)' } : undefined}>{d}</span>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: 350 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(1)', opacity: 0.3 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 32, zIndex: 1 }}>
            <span className="badge-resume">Resume</span>
            <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 24, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
              Rotational Mechanics &amp; Moment of Inertia
            </h2>
            <p className="text-sm" style={{ marginBottom: 20, color: 'rgba(255,255,255,0.6)' }}>Section 4 of 12</p>
            <button className="submit-btn" style={{ letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Continue
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bento-2">
        <div className="section-panel">
          <div className="row" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ flex: 1 }}>Weak Topics</h3>
            <span style={{ color: 'var(--error)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>3 flagged</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weaknesses.map(w => (
              <div key={w.topic} className="weakness-row">
                <div className="row">
                  <div className="weakness-icon">
                    <span className="material-symbols-outlined">{w.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{w.topic}</div>
                    <div className="text-sm" style={{ marginTop: 2 }}>{w.meta}</div>
                  </div>
                </div>
                <button className="btn-ghost">Drill</button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <div className="row" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ flex: 1 }}>Today's Plan</h3>
            <span className="text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Up</span>
          </div>
          <div className="row" style={{ alignItems: 'flex-start', gap: 24 }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 36, color: 'var(--primary)', lineHeight: 1 }}>14</div>
              <div className="text-micro">Oct</div>
            </div>
            <div style={{ flex: 1 }}>
              {schedule.map((s, i) => (
                <div key={s.title} style={{ paddingLeft: 24, borderLeft: `2px solid ${s.primary ? 'rgba(231,249,92,0.3)' : 'rgba(255,255,255,0.05)'}`, position: 'relative', marginBottom: i < schedule.length - 1 ? 24 : 0 }}>
                  {s.primary && <div style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                  <div className="row" style={{ marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{s.title}</div>
                    <div className="text-micro">{s.time}</div>
                  </div>
                  <div className="text-sm">{s.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
