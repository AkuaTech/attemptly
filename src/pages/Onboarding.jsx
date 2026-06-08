import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const features = [
  { icon: 'menu_book', title: 'Real PYQs', desc: 'Practice actual past-year questions from JEE and NEET with step-by-step solutions.' },
  { icon: 'quiz', title: 'Custom Tests', desc: 'Build focused tests from any subject, chapter, and difficulty in the question bank.' },
  { icon: 'insights', title: 'Performance Tracking', desc: 'See your strengths, weaknesses, accuracy trends, and consistency heatmaps.' },
  { icon: 'functions', title: 'Math Rendering', desc: 'Every equation rendered beautifully with LaTeX, just like your textbooks.' },
]

const paths = [
  { num: '01', icon: 'architecture', label: 'JEE Main & Advanced', desc: 'Physics, Mathematics, and Chemistry for engineering entrance exams.' },
  { num: '02', icon: 'science', label: 'NEET Medical', desc: 'Biology, Chemistry, and Physics for medical entrance exams.' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="onboarding-wrap">
      <a href="#onboarding-main" className="sr-only">Skip to content</a>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 0%, rgba(231,249,92,0.08) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(231,249,92,0.05) 0%, transparent 40%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(231,249,92,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="onboarding-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--on-primary)', fontWeight: 900 }}>layers</span>
          </div>
          <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 22, color: 'var(--on-surface)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Prepper</span>
        </div>
        <div className="onboarding-actions">
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '10px 24px', border: '1px solid var(--glass-border)', background: 'var(--hover-white)', color: 'var(--on-surface)', borderRadius: 10, fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(12px)', transition: 'background 150ms ease' }}
          >
            Sign In
          </button>
        </div>
      </div>

      <header id="onboarding-main" style={{ width: '100%', maxWidth: 896, textAlign: 'center', marginBottom: 64, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, background: 'var(--sc)', padding: '6px 16px', borderRadius: 9999, border: '1px solid rgba(72,72,71,0.1)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--fb)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--on-sv)' }}>Free forever for Aspirants</span>
        </div>
        <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(40px, 7vw, 72px)', letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 24 }}>
          JEE & NEET prep <br />
          <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>that actually works.</span>
        </h1>
        <p style={{ color: 'var(--on-sv)', fontSize: 18, maxWidth: 640, margin: '0 auto 40px', fontWeight: 300, lineHeight: 1.6 }}>
          Real PYQs, custom tests, and detailed analytics: everything you need to crack your exam. No fluff.
        </p>
        <button
          className="submit-btn"
          style={{ width: 'auto', padding: '16px 48px', display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '0.08em', fontSize: 15 }}
          onClick={() => navigate('/signup')}
        >
          Get Started
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </header>

      <div className="onboarding-features" style={{ width: '100%', maxWidth: 1000, marginBottom: 80, position: 'relative', zIndex: 1 }}>
        {features.map((f, i) => (
          <div key={f.title} style={{ background: 'rgba(26,25,25,0.5)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: 28, textAlign: 'left', gridColumn: i === 0 ? 'span 2' : undefined }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(231,249,92,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 22 }}>{f.icon}</span>
            </div>
            <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ color: 'var(--on-sv)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 1000, position: 'relative', zIndex: 1, marginBottom: 64 }}>
        <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 32, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 40 }}>
          Choose your <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>path</span>
        </h2>
        <div className="onboarding-path-grid">
          {paths.map(p => (
            <div key={p.num} className="path-card" onClick={() => navigate('/signup')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div className="path-icon-box">
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--primary)' }}>{p.icon}</span>
                </div>
                <span className="path-num">{p.num}</span>
              </div>
              <h3>{p.label}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingBottom: 48 }}>
        <div style={{ width: 96, height: 1, background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', opacity: 0.4, margin: '0 auto 32px' }} />
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Built for aspirants, by aspirants.</p>
      </div>
    </div>
  )
}
