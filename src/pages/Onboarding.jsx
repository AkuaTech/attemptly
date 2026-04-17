import { useNavigate } from 'react-router-dom'

const paths = [
  {
    num: '01', icon: 'architecture', label: 'JEE Main & Advanced',
    desc: 'Engineering excellence path focusing on deep conceptual physics, rigorous mathematics, and analytical chemistry.',
  },
  {
    num: '02', icon: 'science', label: 'NEET Medical',
    desc: 'Biological sciences mastery focusing on intricate physiology, organic chemistry, and high-speed problem solving.',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()

  return (
    <div className="onboarding-wrap">
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 0%, rgba(231,249,92,0.08) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(231,249,92,0.05) 0%, transparent 40%)' }} />
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=60"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, filter: 'grayscale(1) brightness(0.5)' }}
        />
      </div>

      <div style={{ position: 'fixed', top: 32, left: 32, zIndex: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
          <span className="material-symbols-outlined" style={{ color: '#000', fontWeight: 900 }}>layers</span>
        </div>
        <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Prepper</span>
      </div>

      <header style={{ width: '100%', maxWidth: 896, textAlign: 'center', marginBottom: 64, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, background: 'var(--sc)', padding: '6px 16px', borderRadius: 9999, border: '1px solid rgba(72,72,71,0.1)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--fb)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--on-sv)' }}>Pick your exam target</span>
        </div>
        <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(40px, 7vw, 72px)', letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 24 }}>
          CHOOSE YOUR PATH <br />
          <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>TO MASTERY</span>
        </h1>
        <p style={{ color: 'var(--on-sv)', fontSize: 18, maxWidth: 640, margin: '0 auto', fontWeight: 300, lineHeight: 1.6 }}>
          JEE or NEET — choose your path and we'll build everything around it.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, width: '100%', maxWidth: 1000, marginBottom: 64, position: 'relative', zIndex: 1 }}>
        {paths.map(p => (
          <div key={p.num} className="path-card" onClick={() => navigate('/dashboard')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div className="path-icon-box">
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--primary)' }}>{p.icon}</span>
              </div>
              <span className="path-num">{p.num}</span>
            </div>
            <h3>{p.label}</h3>
            <p>{p.desc}</p>
            <div className="row" style={{ marginTop: 32 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(72,72,71,0.2)' }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--fh)', fontWeight: 700, color: 'var(--primary)', opacity: 0, transition: 'opacity 300ms ease' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >SELECT PATH</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 96, height: 1, background: 'linear-gradient(90deg, transparent, #e7f95c, transparent)', opacity: 0.4 }} />
        <button
          className="submit-btn"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.1em' }}
          onClick={() => navigate('/dashboard')}
        >
          CONTINUE TO PREPPER
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
        <p style={{ fontSize: 13, color: 'rgba(173,170,170,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>PATH CAN BE ADJUSTED LATER IN SETTINGS</p>
      </div>

    </div>
  )
}
