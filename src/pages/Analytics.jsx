import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import { SkeletonCard, SkeletonPage } from '../components/Skeleton'
import { cacheGet, cacheSet, cacheIsStale } from '../lib/cache'

const HEATMAP_DAYS = 364
const HEATMAP_WEEKS = HEATMAP_DAYS / 7

function dayKey(date) { return date.toISOString().slice(0, 10) }

function buildHeatmapCells(attempts) {
  const counts = new Map()
  for (const a of attempts) {
    const k = a.attempted_at.slice(0, 10)
    counts.set(k, (counts.get(k) || 0) + 1)
  }
  const cells = []
  const today = new Date()
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    cells.push({ date: dayKey(d), count: counts.get(dayKey(d)) || 0 })
  }
  return cells
}

function streak(cells) {
  let s = 0
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i].count > 0) s++
    else break
  }
  return s
}

function bucketColor(count, peak) {
  if (count === 0) return 'var(--sc-high)'
  const ratio = count / Math.max(1, peak)
  if (ratio > 0.66) return 'var(--primary)'
  if (ratio > 0.33) return 'rgba(231,249,92,0.5)'
  return 'rgba(231,249,92,0.2)'
}

function HeatmapGrid({ cells }) {
  const peak = cells.reduce((m, c) => Math.max(m, c.count), 0)
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gridAutoFlow: 'column', gap: 4, width: 'max-content' }}>
        {cells.map((c, i) => (
          <div
            key={i}
            className="heatmap-cell"
            style={{ background: bucketColor(c.count, peak) }}
            title={`${c.date} · ${c.count} question${c.count === 1 ? '' : 's'}`}
          />
        ))}
      </div>
    </div>
  )
}

function buildMonthlyAccuracy(attempts) {
  const buckets = new Map()
  for (const a of attempts) {
    const k = a.attempted_at.slice(0, 7)
    if (!buckets.has(k)) buckets.set(k, { total: 0, correct: 0 })
    const b = buckets.get(k)
    b.total++
    if (a.is_correct) b.correct++
  }
  const months = [...buckets.entries()]
    .map(([k, v]) => ({ month: k, accuracy: v.correct / v.total, total: v.total }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
  return months
}

function buildSubjectSplit(progressRows) {
  const totals = { Physics: 0, Chemistry: 0, Mathematics: 0 }
  let grand = 0
  for (const r of progressRows) {
    if (totals[r.subject] != null) {
      totals[r.subject] += r.questions_solved || 0
      grand += r.questions_solved || 0
    }
  }
  const split = ['Physics', 'Chemistry', 'Mathematics'].map(s => ({
    label: s,
    pct: grand > 0 ? totals[s] / grand : 0,
  }))
  const masteredCorrect = progressRows.reduce((s, r) => s + (r.questions_correct || 0), 0)
  const masteredTotal = progressRows.reduce((s, r) => s + (r.questions_solved || 0), 0)
  return { split, masteryPct: masteredTotal > 0 ? masteredCorrect / masteredTotal : 0 }
}

function deriveInsights({ attempts, progress, monthly }) {
  const insights = []
  // 1) plateau / dropping topic
  const weak = progress
    .filter(r => (r.questions_solved || 0) >= 5)
    .map(r => ({ ...r, accuracy: r.questions_correct / r.questions_solved }))
    .sort((a, b) => a.accuracy - b.accuracy)[0]
  if (weak && weak.accuracy < 0.6) {
    insights.push({
      type: 'primary',
      icon: 'bolt',
      title: weak.topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      body: `Accuracy ${Math.round(weak.accuracy * 100)}% across ${weak.questions_solved} attempts. Drill this topic to recover ground.`,
    })
  }
  // 2) accuracy trend
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1]
    const prev = monthly[monthly.length - 2]
    const delta = last.accuracy - prev.accuracy
    if (delta < -0.05) {
      insights.push({
        type: 'error',
        icon: 'warning',
        title: 'Monthly accuracy dropping',
        body: `Accuracy fell ${Math.round(-delta * 100)}% from last month. Slow down and review explanations before moving on.`,
      })
    } else if (delta > 0.05) {
      insights.push({
        type: 'primary',
        icon: 'trending_up',
        title: 'Accuracy trending up',
        body: `+${Math.round(delta * 100)}% versus last month. Keep the cadence steady.`,
      })
    }
  }
  // 3) volume nudge
  if (attempts.length === 0) {
    insights.push({
      type: 'primary',
      icon: 'flag',
      title: 'No data yet',
      body: 'Solve questions in the Subjects section to start building analytics.',
    })
  }
  return insights
}

export default function Analytics() {
  const { user } = useAuth()
  const cacheKey = user ? `analytics_${user.id}` : null
  const cached = cacheKey ? cacheGet(cacheKey) : null
  const [data, setData] = useState(cached || { attempts: [], progress: [], loading: true, error: null })

  useEffect(() => {
    if (!user || !cacheKey) { setData(d => ({ ...d, loading: false })); return }
    if (cached && !cacheIsStale(cacheKey)) return
    
    let cancelled = false
    async function load() {
      const sinceYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      const [attemptsRes, progressRes] = await Promise.all([
        supabase
          .from('user_attempts')
          .select('attempted_at, is_correct, time_spent_ms, subject')
          .eq('user_id', user.id)
          .gte('attempted_at', sinceYear)
          .order('attempted_at', { ascending: true }),
        supabase
          .from('user_progress')
          .select('subject, chapter, topic, questions_solved, questions_correct, total_time_ms')
          .eq('user_id', user.id),
      ])
      if (cancelled) return
      const result = {
        attempts: attemptsRes.data || [],
        progress: progressRes.data || [],
        loading: false,
        error: attemptsRes.error || progressRes.error,
      }
      cacheSet(cacheKey, result)
      setData(result)
    }
    load()
    return () => { cancelled = true }
  }, [user, cacheKey, cached])

  const cells = useMemo(() => buildHeatmapCells(data.attempts), [data.attempts])
  const dayStreak = useMemo(() => streak(cells), [cells])
  const monthly = useMemo(() => buildMonthlyAccuracy(data.attempts), [data.attempts])
  const { split, masteryPct } = useMemo(() => buildSubjectSplit(data.progress), [data.progress])
  const insights = useMemo(() => deriveInsights({ attempts: data.attempts, progress: data.progress, monthly }), [data])

  const overallTotal = data.attempts.length
  const overallCorrect = data.attempts.filter(a => a.is_correct).length
  const overallAccuracy = overallTotal > 0 ? overallCorrect / overallTotal : 0
  const avgTimeSec = overallTotal > 0
    ? data.attempts.reduce((s, a) => s + (a.time_spent_ms || 0), 0) / overallTotal / 1000
    : 0
  const avgTimeMin = avgTimeSec / 60
  const peakAccuracy = monthly.length ? Math.max(...monthly.map(m => m.accuracy)) : 0

  // Radar polygon: accuracy / speed / volume / consistency, each 0..1
  const speedScore = avgTimeSec > 0 ? Math.min(1, 90 / Math.max(30, avgTimeSec)) : 0 // 90s/q => 1.0, slower → less
  const volumeScore = Math.min(1, overallTotal / 500)
  const activeDays = cells.filter(c => c.count > 0).length
  const consistencyScore = Math.min(1, activeDays / 90)
  const radarVals = [overallAccuracy, speedScore, consistencyScore, volumeScore]
  const radarPoints = [
    [100, 100 - 80 * radarVals[0]],   // top - accuracy
    [100 + 80 * radarVals[1], 100],   // right - speed
    [100, 100 + 80 * radarVals[2]],   // bottom - consistency
    [100 - 80 * radarVals[3], 100],   // left - volume
  ].map(p => p.join(',')).join(' ')

  // accuracy trend chart
  const trendPath = monthly.length >= 2
    ? monthly.map((m, i) => {
        const x = (i / (monthly.length - 1)) * 1000
        const y = 200 - m.accuracy * 180
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      }).join(' ')
    : null

  if (data.loading) {
    return (
      <SkeletonPage>
        <div className="bento-2 mb-24">
          <SkeletonCard lines={4} h={320} />
          <SkeletonCard lines={3} h={320} />
        </div>
        <SkeletonCard lines={2} h={200} />
      </SkeletonPage>
    )
  }

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <div className="editorial-tag">
          <div className="line" />
          <span>Deep Analytics</span>
        </div>
        <h1 className="page-title">Analysis</h1>
        <p className="page-sub">Accuracy, speed, consistency, and subject breakdown.</p>
      </header>

      <div className="bento-2 mb-24">
        <div className="glass-card editorial-card accent-card">
          <div className="row mb-12">
            <h3 className="section-label flex-1">Skill Breakdown</h3>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>analytics</span>
          </div>
          <div className="flex items-center justify-center" style={{ height: 240 }}>
            <svg width="240" height="240" viewBox="0 0 200 200" className="chart-svg overflow-visible">
              <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="var(--outline-v)" strokeWidth="0.5" strokeDasharray="2 2" />
              <polygon points="100,50 150,100 100,150 50,100" fill="none" stroke="var(--outline-v)" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="2" fill="var(--outline-v)" />
              {overallTotal > 0 && (
                <polygon points={radarPoints} fill="rgba(231,249,92,0.15)" stroke="var(--primary)" strokeWidth="2" />
              )}
              <text x="100" y="15" fill="var(--on-sv)" fontSize="8" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700">ACCURACY</text>
              <text x="195" y="103" fill="var(--on-sv)" fontSize="8" textAnchor="start" fontFamily="Space Grotesk" fontWeight="700">SPEED</text>
              <text x="100" y="195" fill="var(--on-sv)" fontSize="8" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700">CONSISTENCY</text>
              <text x="5" y="103" fill="var(--on-sv)" fontSize="8" textAnchor="end" fontFamily="Space Grotesk" fontWeight="700">VOLUME</text>
            </svg>
          </div>
          <div className="analytics-metric-grid">
            <div className="analytics-metric">
              <p className="text-micro">Accuracy</p>
              <p className="analytics-metric-value text-primary">
                {overallTotal > 0 ? `${(overallAccuracy * 100).toFixed(1)}` : '—'}
              </p>
            </div>
            <div className="analytics-metric">
              <p className="text-micro">Total Solved</p>
              <p className="analytics-metric-value">{overallTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="glass-card editorial-card accent-card analytics-subject-card">
          <h3 className="section-label mb-16">Subject Split</h3>
          <div className="analytics-subject-body">
            <div className="relative" style={{ width: 160, height: 160 }}>
              <svg className="absolute-inset-0" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--sc-bright)" strokeWidth="12" />
                {overallTotal > 0 && (() => {
                  const C = 2 * Math.PI * 70
                  let offset = 0
                  return split.map((s, i) => {
                    const len = s.pct * C
                    const dasharray = `${len} ${C - len}`
                    const dashoffset = -offset
                    offset += len
                    const color = i === 0 ? 'var(--primary)' : i === 1 ? 'var(--tertiary)' : 'rgba(255,255,255,0.2)'
                    return (
                      <circle
                        key={s.label}
                        cx="80" cy="80" r="70" fill="transparent"
                        stroke={color} strokeWidth="12"
                        strokeDasharray={dasharray}
                        strokeDashoffset={dashoffset}
                      />
                    )
                  })
                })()}
              </svg>
              <div className="absolute-inset-0 flex-col items-center justify-center">
                <span className="text-black" style={{ fontFamily: 'var(--fh)', fontSize: 24 }}>
                  {overallTotal > 0 ? `${Math.round(masteryPct * 100)}%` : '—'}
                </span>
                <span className="text-micro">Mastered</span>
              </div>
            </div>
            <ul className="flex-col gap-16">
              {split.map((s, i) => (
                <li key={s.label} className="row gap-12">
                  <div className="flex-shrink-0" style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--tertiary)' : 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <p className="text-bold" style={{ fontFamily: 'var(--fh)', fontSize: 11 }}>{s.label}</p>
                    <p className="text-micro">{Math.round(s.pct * 100)}%</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-card editorial-card accent-card mb-24">
        <div className="analytics-heatmap-head">
          <div className="flex-1">
            <h3 className="section-label">Consistency</h3>
            <p className="text-micro mt-4">{dayStreak} Day Streak</p>
          </div>
          <div className="analytics-heatmap-legend">
            <span className="text-micro">Less</span>
            {['var(--sc-high)', 'rgba(231,249,92,0.2)', 'rgba(231,249,92,0.5)', 'var(--primary)'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
            ))}
            <span className="text-micro">More</span>
          </div>
        </div>
        <HeatmapGrid cells={cells} />
      </div>

      <div className="bento-2">
        <div className="glass-card editorial-card accent-card">
          <div className="row" style={{ marginBottom: 24 }}>
            <h3 className="section-label" style={{ flex: 1 }}>Accuracy Trend</h3>
            <div className="row" style={{ gap: 16 }}>
              <span className="row" style={{ gap: 4, fontSize: 11, fontFamily: 'var(--fh)', fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} /> Monthly
              </span>
            </div>
          </div>
          <div style={{ position: 'relative', height: 180 }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="accGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {trendPath && (
                <>
                  <path d={`${trendPath} L1000,200 L0,200 Z`} fill="url(#accGrad)" />
                  <path d={trendPath} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
            {peakAccuracy > 0 && (
              <div className="absolute top-8 right-1/4 py-6 px-10 bg-glass-bright border border-glass rounded-lg backdrop-blur-md">
                <p className="text-micro" style={{ letterSpacing: '0.08em', fontSize: 9 }}>Peak</p>
                <p className="text-primary text-bold" style={{ fontFamily: 'var(--fh)', fontSize: 12 }}>{(peakAccuracy * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
            {monthly.length > 0 ? monthly.map(m => (
              <span key={m.month} className="text-micro">
                {new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
              </span>
            )) : <span className="text-micro text-muted">No data yet</span>}
          </div>
        </div>

        <div className="glass-card editorial-card accent-card flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-primary mb-12" style={{ fontSize: 36 }}>timer</span>
          <p className="text-micro mb-6">Speed</p>
          <div className="row items-baseline gap-8 mb-12">
            <span className="text-black" style={{ fontFamily: 'var(--fh)', fontSize: 42, letterSpacing: '-0.02em' }}>
              {avgTimeMin > 0 ? avgTimeMin.toFixed(1) : '—'}
            </span>
            <span className="text-primary text-bold" style={{ fontFamily: 'var(--fh)', fontSize: 14 }}>min/q</span>
          </div>
          <p className="text-micro max-w-xs leading-relaxed" style={{ textTransform: 'none', letterSpacing: '0' }}>
            {overallTotal > 0
              ? <>Across <strong className="text-white">{overallTotal.toLocaleString()}</strong> attempts.</>
              : <>Start practicing to see your average solve time.</>}
          </p>
          <div className="neon-progress-track mt-24 w-full">
            <div className="neon-progress-fill" style={{ width: `${Math.round(speedScore * 100)}%` }} />
          </div>
        </div>
      </div>

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em', marginBottom: 24 }}>
          Insights
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {insights.length === 0 ? (
            <div className="text-muted text-sm" style={{ padding: 24 }}>
              Insights will appear here as you build up practice history.
            </div>
          ) : insights.map((item, i) => (
            <div key={i} className={`insight-card ${item.type}`}>
              <span className="material-symbols-outlined" style={{ color: item.type === 'primary' ? 'var(--primary)' : 'var(--error)', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <h4 style={{ fontFamily: 'var(--fh)', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6 }}>{item.title}</h4>
                <p className="text-sm" style={{ lineHeight: 1.6 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
