import { Link, useParams } from 'react-router-dom'
import { useChapters } from '../hooks/useTaxonomy'
import { slugToTitle } from '../lib/slug'

export default function ChaptersList() {
  const { subject } = useParams()
  const { chapters, loading, error } = useChapters(subject)

  return (
    <div className="page-canvas">
      <header style={{ marginBottom: 48 }}>
        <div className="editorial-tag">
          <div className="line" />
          <span>
            <Link to="/subjects" style={{ color: 'inherit', textDecoration: 'none' }}>Subjects</Link>
            {' / '}{subject}
          </span>
        </div>
        <h1 className="page-title">
          {subject}{' '}
          <span style={{ color: 'var(--primary)' }}>Chapters.</span>
        </h1>
        <p className="page-sub">
          {loading ? 'Loading chapters…' : `${chapters.length} chapters available.`}
        </p>
      </header>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: 14 }}>
          Couldn't load chapters: {error.message}
        </div>
      )}

      {!loading && !error && chapters.length === 0 && (
        <div style={{ color: 'var(--on-sv)', fontSize: 14 }}>
          No chapters found for {subject}.
        </div>
      )}

      <div className="bento-4">
        {chapters.map((c, i) => (
          <Link
            key={c.slug}
            to={`/subjects/${encodeURIComponent(subject)}/${encodeURIComponent(c.slug)}`}
            className="glass-card subject-card glass-card-hover"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div style={{ padding: 16, background: 'rgba(231,249,92,0.1)', borderRadius: 16, color: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36 }}>menu_book</span>
              </div>
              <span className="text-sm">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3>{slugToTitle(c.slug)}</h3>
            <p>{c.count} question{c.count === 1 ? '' : 's'}</p>
            <div style={{ marginTop: 'auto' }}>
              <button className="subject-enter-btn">Open Chapter</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
