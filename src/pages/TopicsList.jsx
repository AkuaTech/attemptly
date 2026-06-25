import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTopics } from '../hooks/useTaxonomy'
import { slugToTitle } from '../lib/slug'
import { SkeletonGridCard } from '../components/Skeleton'

const TIME_OPTIONS = [
  { label: 'No limit', value: 0 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
]

export default function TopicsList() {
  const { subject, chapter } = useParams()
  const navigate = useNavigate()
  const { topics, loading, error } = useTopics(subject, chapter)
  const [pendingHref, setPendingHref] = useState(null)
  const [limit, setLimit] = useState(0)
  const [customActive, setCustomActive] = useState(false)
  const [customVal, setCustomVal] = useState('')

  const practiceAllHref = `/practice?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`

  function openPicker(href) {
    setLimit(0)
    setCustomActive(false)
    setCustomVal('')
    setPendingHref(href)
  }

  function startPractice() {
    const effectiveLimit = customActive ? (parseInt(customVal, 10) || 0) : limit
    const url = effectiveLimit > 0 ? `${pendingHref}&timelimit=${effectiveLimit}` : pendingHref
    navigate(url)
    setPendingHref(null)
  }

  return (
    <div className="page-canvas">
      <header style={{ marginBottom: 48 }}>
        <div className="editorial-tag">
          <div className="line" />
          <span>
            <Link to="/subjects" style={{ color: 'inherit', textDecoration: 'none' }}>Subjects</Link>
            {' / '}
            <Link to={`/subjects/${encodeURIComponent(subject)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{subject}</Link>
            {' / '}{slugToTitle(chapter)}
          </span>
        </div>
        <h1 className="page-title">
          {slugToTitle(chapter)}{' '}
          <span style={{ color: 'var(--primary)' }}>Topics.</span>
        </h1>
        <p className="page-sub">
          {loading ? '' : `${topics.length} topic${topics.length === 1 ? '' : 's'} in this chapter.`}
        </p>
        {!loading && !error && topics.length > 0 && (
          <button
            className="btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '8px 16px', cursor: 'pointer', background: 'none' }}
            onClick={() => openPicker(practiceAllHref)}
          >
            Practice whole chapter
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        )}
      </header>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: 14 }}>
          Couldn't load topics: {error.message}
        </div>
      )}

      {!loading && !error && topics.length === 0 && (
        <div style={{ color: 'var(--on-sv)', fontSize: 14 }}>
          No topics found for this chapter.
        </div>
      )}

      <div className="bento-4">
        {loading ? (
          <>
            <SkeletonGridCard />
            <SkeletonGridCard />
            <SkeletonGridCard />
            <SkeletonGridCard />
            <SkeletonGridCard />
            <SkeletonGridCard />
            <SkeletonGridCard />
            <SkeletonGridCard />
          </>
        ) : topics.map((t, i) => {
          const href = `/practice?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}&topic=${encodeURIComponent(t.slug)}`
          return (
            <div
              key={t.slug}
              className="glass-card subject-card glass-card-hover curriculum-card"
              style={{ color: 'inherit', cursor: 'pointer' }}
              onClick={() => openPicker(href)}
              role="button"
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openPicker(href)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div className="curriculum-icon curriculum-icon-lg">
                  <span className="material-symbols-outlined" style={{ fontSize: 36 }}>label</span>
                </div>
                <span className="text-sm">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{slugToTitle(t.slug)}</h3>
              <p>{t.count} question{t.count === 1 ? '' : 's'}</p>
              <div style={{ marginTop: 'auto' }}>
                <button className="subject-enter-btn" tabIndex={-1}>Start Practice</button>
              </div>
            </div>
          )
        })}
      </div>

      {pendingHref && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setPendingHref(null)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 380, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--outline)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 22 }}>timer</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Set a time limit</p>
                  <p style={{ color: 'var(--on-sv)', fontSize: 12, marginTop: 2 }}>Session ends automatically when time runs out</p>
                </div>
              </div>
            </div>

            {/* Selected value */}
            <div style={{ padding: '20px 24px 4px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 48, letterSpacing: '-0.04em', lineHeight: 1, color: (customActive && !customVal) || limit === 0 ? 'var(--muted)' : 'var(--primary)', transition: 'color 150ms' }}>
                {customActive ? (customVal || '?') : limit === 0 ? '∞' : limit >= 60 ? `${limit / 60}` : limit}
              </span>
              {(customActive ? !!customVal : limit > 0) && (
                <span style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18, color: 'var(--on-sv)' }}>
                  {!customActive && limit >= 60 ? 'hr' : 'min'}
                </span>
              )}
              {!customActive && limit === 0 && (
                <span style={{ fontFamily: 'var(--fh)', fontWeight: 600, fontSize: 14, color: 'var(--muted)' }}>no limit</span>
              )}
            </div>

            {/* Option grid */}
            <div style={{ padding: '16px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
              {TIME_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => { setLimit(o.value); setCustomActive(false); setCustomVal('') }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 8,
                    border: `1.5px solid ${!customActive && limit === o.value ? 'var(--primary)' : 'var(--outline)'}`,
                    background: !customActive && limit === o.value ? 'var(--primary-faint)' : 'transparent',
                    color: !customActive && limit === o.value ? 'var(--primary)' : 'var(--on-sv)',
                    fontFamily: 'var(--fh)',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'border-color 150ms, background 150ms, color 150ms',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {o.label}
                </button>
              ))}
              {/* Custom tile */}
              <button
                onClick={() => { setCustomActive(true); setCustomVal('') }}
                style={{
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: `1.5px solid ${customActive ? 'var(--primary)' : 'var(--outline)'}`,
                  background: customActive ? 'var(--primary-faint)' : 'transparent',
                  color: customActive ? 'var(--primary)' : 'var(--on-sv)',
                  fontFamily: 'var(--fh)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'border-color 150ms, background 150ms, color 150ms',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                Custom
              </button>
            </div>

            {/* Custom time input */}
            {customActive && (
              <div style={{ padding: '10px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--primary)', background: 'var(--primary-faint)' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 25"
                    value={customVal}
                    autoFocus
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '')
                      setCustomVal(raw)
                      const n = parseInt(raw, 10)
                      if (n > 0 && n <= 300) setLimit(n)
                    }}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--primary)', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, minWidth: 0 }}
                  />
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>min</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '4px 24px 24px', display: 'flex', gap: 10 }}>
              <button
                className="btn-outline"
                style={{ flex: 1, padding: '11px 16px', borderRadius: 10, fontSize: 13 }}
                onClick={() => setPendingHref(null)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                style={{ flex: 2, width: 'auto', padding: '11px 16px', fontSize: 13 }}
                onClick={startPractice}
              >
                Start Practice
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
