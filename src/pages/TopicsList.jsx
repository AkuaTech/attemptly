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

  const practiceAllHref = `/practice?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`

  function openPicker(href) {
    setLimit(0)
    setPendingHref(href)
  }

  function startPractice() {
    const url = limit > 0 ? `${pendingHref}&timelimit=${limit}` : pendingHref
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setPendingHref(null)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 400, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <p className="text-micro" style={{ marginBottom: 6 }}>Before you start</p>
              <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>Set a time limit</h3>
              <p style={{ color: 'var(--on-sv)', fontSize: 13, marginTop: 6 }}>
                The session ends automatically when time runs out.
              </p>
            </div>
            <div className="row gap-8 flex-wrap">
              {TIME_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`filter-pill ${limit === o.value ? 'active' : ''}`}
                  onClick={() => setLimit(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="row gap-12" style={{ marginTop: 4 }}>
              <button
                className="btn-outline"
                style={{ padding: '10px 16px', borderRadius: 10, flex: 1 }}
                onClick={() => setPendingHref(null)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                style={{ width: 'auto', flex: 1, padding: '10px 16px' }}
                onClick={startPractice}
              >
                Start
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
