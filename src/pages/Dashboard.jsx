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

          <svg width="100%" height="180" viewBox="-10 0 420 100" className="chart-svg overflow-visible">
            <defs>
              <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e7f95c" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#e7f95c" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,80 Q50,90 80,60 T150,40 T220,70 T300,20 T400,35 L400,100 L0,100 Z" fill="url(#chartGrad)" />
            <path d="M0,80 Q50,90 80,60 T150,40 T220,70 T300,20 T400,35" fill="none" stroke="#e7f95c" strokeWidth="4" strokeLinecap="round" />
          </svg>

          <div className="flex justify-between mt-16 px-8">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
              <span key={d} className={`text-micro ${i === 5 ? 'text-primary' : ''}`}>{d}</span>
            ))}
          </div>
        </div>

        <div className="glass-card editorial-card-flush relative overflow-hidden" style={{ minHeight: 300 }}>
          <div className="absolute-inset-0 chart-bg-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80')", opacity: 'var(--hero-opacity)' }} />
          <div className="absolute-inset-0 chart-overlay" />
          <div className="absolute-inset-0 flex-col justify-end editorial-card z-10" style={{ padding: 24 }}>
            <span className="badge-resume">Resume</span>
            <h2 className="text-white text-heavy mb-4" style={{ fontFamily: 'var(--fh)', fontSize: 18, lineHeight: 1.2 }}>
              Rotational Mechanics
            </h2>
            <p className="text-micro text-muted mb-8">Moment of Inertia · Part 4</p>
            <div style={{ maxWidth: 160 }}>
              <button className="submit-btn" style={{ padding: '10px 16px' }}>
                Continue
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bento-2">
        <div className="glass-card editorial-card">
          <div className="row mb-12">
            <h3 className="section-title flex-1">Weak Topics</h3>
            <span className="text-error text-micro">3 Flagged</span>
          </div>
          <div className="flex-col gap-12">
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

        <div className="glass-card editorial-card">
          <div className="row mb-12">
            <h3 className="section-title flex-1">Today's Plan</h3>
            <span className="text-micro text-primary">Next Up</span>
          </div>
          <div className="row items-start gap-24">
            <div className="text-center flex-shrink-0" style={{ paddingTop: 8 }}>
              <div className="text-primary text-black" style={{ fontFamily: 'var(--fh)', fontSize: 28, lineHeight: 1 }}>14</div>
              <div className="text-micro mt-4">Oct</div>
            </div>
            <div style={{ flex: 1 }}>
              {schedule.map((s, i) => (
                <div key={s.title} className={`relative mb-24 pl-24 schedule-item ${s.primary ? 'active' : ''}`}>
                  {s.primary && <div className="schedule-dot" />}
                  <div className="row mb-4">
                    <div className="text-bold flex-1" style={{ fontSize: 12 }}>{s.title}</div>
                    <div className="text-micro text-muted">{s.time}</div>
                  </div>
                  <div className="text-micro text-on-sv">{s.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
