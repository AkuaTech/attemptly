import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTopics } from '../hooks/useTaxonomy'
import { slugToTitle } from '../lib/slug'
import { SkeletonGridCard } from '../components/Skeleton'

export default function TopicsList() {
  const { subject, chapter } = useParams()
  const navigate = useNavigate()
  const { topics, loading, error } = useTopics(subject, chapter)

  const practiceAllHref = `/practice?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`

  return (
    <div className="page-canvas">
      <header style={{ marginBottom: 48 }}>
        <button
          className="btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px', marginBottom: 20 }}
          onClick={() => navigate(`/subjects/${encodeURIComponent(subject)}`)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          {subject}
        </button>
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
            onClick={() => navigate(practiceAllHref)}
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
              onClick={() => navigate(href)}
              role="button"
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(href)}
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
    </div>
  )
}
