import { Link, useNavigate } from 'react-router-dom'

const subjects = [
  { slug: 'Mathematics', icon: 'functions', name: 'Mathematics', desc: 'Calculus, Algebra, Coordinate Geometry, & Trigonometry.' },
  { slug: 'Physics', icon: 'bolt', name: 'Physics', desc: 'Mechanics, Electromagnetism, & Modern Physics.' },
  { slug: 'Chemistry', icon: 'experiment', name: 'Chemistry', desc: 'Organic Synthesis, Physical Chemistry, & Inorganic.' },
]

function SubjectCard({ subject }) {
  return (
    <Link to={`/subjects/${encodeURIComponent(subject.slug)}`} className="glass-card subject-card glass-card-hover" style={{ textDecoration: 'none', color: 'inherit', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', padding: 12, background: 'var(--glass-bright)', borderRadius: 12, color: 'var(--primary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{subject.icon}</span>
        </div>
      </div>

      <h3 style={{ fontSize: 18 }}>{subject.name}</h3>
      <p style={{ fontSize: 12, opacity: 0.6 }}>{subject.desc}</p>

      <div style={{ marginTop: 'auto' }}>
        <button className="subject-enter-btn" style={{ padding: 12, fontSize: 12 }}>Chapters</button>
      </div>
    </Link>
  )
}

export default function Subjects() {
  const navigate = useNavigate()
  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <div className="editorial-tag">
          <div className="line" />
          <span>Curriculum 2026</span>
        </div>
        <h1 className="page-title">
          Select Your <span style={{ color: 'var(--primary)' }}>Subject.</span>
        </h1>
        <p className="page-sub">
          Choose a discipline to continue your preparation.
        </p>
      </header>

      <div className="bento-4">
        {subjects.map(s => <SubjectCard key={s.slug} subject={s} />)}
      </div>

      <section style={{ marginTop: 40, position: 'relative', borderRadius: 12, overflow: 'hidden', height: 200, display: 'flex', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--overlay-h)', zIndex: 1 }} />
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', opacity: 'var(--hero-opacity)' }}
        />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px' }}>
          <h4 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, color: 'var(--primary)', marginBottom: 8, letterSpacing: '-0.01em' }}>Diagnostic Test</h4>
          <p className="text-micro" style={{ maxWidth: 380, textTransform: 'none', letterSpacing: '0', opacity: 0.7 }}>Assess your readiness in 15 minutes. We'll build a custom study plan based on your results.</p>
          <button
            className="btn-ghost"
            style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '6px 12px' }}
            onClick={() => navigate('/practice?diagnostic=1')}
          >
            Start
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  )
}
