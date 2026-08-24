import { Link, useNavigate } from 'react-router-dom'

const subjects = [
  { slug: 'Mathematics', icon: 'functions', name: 'Mathematics', desc: 'Calculus, Algebra, Coordinate Geometry, & Trigonometry.' },
  { slug: 'Physics', icon: 'bolt', name: 'Physics', desc: 'Mechanics, Electromagnetism, & Modern Physics.' },
  { slug: 'Chemistry', icon: 'science', name: 'Chemistry', desc: 'Organic Synthesis, Physical Chemistry, & Inorganic.' },
]

function SubjectCard({ subject }) {
  return (
    <Link to={`/subjects/${encodeURIComponent(subject.slug)}`} className="glass-card subject-card glass-card-hover accent-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="curriculum-icon">
        <span className="material-symbols-outlined">{subject.icon}</span>
      </div>

      <h3>{subject.name}</h3>
      <p>{subject.desc}</p>

      <button className="subject-enter-btn">Chapters</button>
    </Link>
  )
}

export default function Subjects() {
  const navigate = useNavigate()
  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <h1 className="page-title">
          Select Your <span style={{ color: 'var(--primary)' }}>Subject.</span>
        </h1>
        <p className="page-sub">
          Choose a discipline to continue your preparation.
        </p>
      </header>

      <div className="bento-3">
        {subjects.map(s => <SubjectCard key={s.slug} subject={s} />)}
      </div>

      <section className="glass-card" style={{ marginTop: 24, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div className="curriculum-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
          <span className="material-symbols-outlined">troubleshoot</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Diagnostic Test</h4>
          <p style={{ fontSize: 12.5, color: 'var(--on-sv)', margin: 0 }}>15 min cross-subject assessment, builds your study plan from the results</p>
        </div>
        <button className="btn-start" style={{ flexShrink: 0 }} onClick={() => navigate('/practice?diagnostic=1')}>
          Start
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
        </button>
      </section>
    </div>
  )
}
