import { ArrowRight, Crosshair, Sigma, Lightning, Flask } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'

const subjects = [
  { slug: 'Mathematics', icon: Sigma, name: 'Mathematics', desc: 'Calculus, Algebra, Coordinate Geometry, & Trigonometry.' },
  { slug: 'Physics', icon: Lightning, name: 'Physics', desc: 'Mechanics, Electromagnetism, & Modern Physics.' },
  { slug: 'Chemistry', icon: Flask, name: 'Chemistry', desc: 'Organic Synthesis, Physical Chemistry, & Inorganic.' },
]

function SubjectCard({ subject }) {
  const Icon = subject.icon
  return (
    <Link to={`/subjects/${encodeURIComponent(subject.slug)}`} className="glass-card subject-card glass-card-hover accent-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="curriculum-icon">
        <Icon size={22} />
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
          <Crosshair size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Diagnostic Test</h4>
          <p style={{ fontSize: 12.5, color: 'var(--on-sv)', margin: 0 }}>15 min cross-subject assessment, builds your study plan from the results</p>
        </div>
        <button className="btn-start" style={{ flexShrink: 0 }} onClick={() => navigate('/practice?diagnostic=1')}>
          Start
          <ArrowRight size={14} />
        </button>
      </section>
    </div>
  )
}
