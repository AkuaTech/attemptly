import { Link } from 'react-router-dom'

const subjects = [
  { slug: 'Mathematics', icon: 'functions', name: 'Mathematics', desc: 'Calculus, Algebra, Coordinate Geometry, & Trigonometry.' },
  { slug: 'Physics', icon: 'bolt', name: 'Physics', desc: 'Mechanics, Electromagnetism, & Modern Physics.' },
  { slug: 'Chemistry', icon: 'experiment', name: 'Chemistry', desc: 'Organic Synthesis, Physical Chemistry, & Inorganic.' },
]

function SubjectCard({ subject }) {
  return (
    <Link to={`/subjects/${encodeURIComponent(subject.slug)}`} className="glass-card subject-card glass-card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', padding: 16, background: 'rgba(231,249,92,0.1)', borderRadius: 16, color: 'var(--primary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>{subject.icon}</span>
        </div>
      </div>

      <h3>{subject.name}</h3>
      <p>{subject.desc}</p>

      <div style={{ marginTop: 'auto' }}>
        <button className="subject-enter-btn">Browse Chapters</button>
      </div>
    </Link>
  )
}

export default function Subjects() {
  return (
    <div className="page-canvas">
      <header style={{ marginBottom: 48 }}>
        <div className="editorial-tag">
          <div className="line" />
          <span>Curriculum 2026</span>
        </div>
        <h1 className="page-title">
          Select Your <br />
          <span style={{ color: 'var(--primary)' }}>Subject.</span>
        </h1>
        <p className="page-sub">
          Choose a discipline to continue your preparation.
        </p>
      </header>

      <div className="bento-4">
        {subjects.map(s => <SubjectCard key={s.slug} subject={s} />)}
      </div>

      <section style={{ marginTop: 64, position: 'relative', borderRadius: 16, overflow: 'hidden', height: 256, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #000, rgba(0,0,0,0.8), transparent)', zIndex: 1 }} />
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', opacity: 0.5 }}
        />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px' }}>
          <h4 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 28, color: 'var(--primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Diagnostic Test</h4>
          <p className="text-sm" style={{ maxWidth: 440 }}>Figure out your strengths and weak areas in 15 minutes. We'll build a study plan from there.</p>
          <button className="btn-ghost" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '8px 16px' }}>
            Start
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  )
}
