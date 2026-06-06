import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { user, signInWithEmail, signInWithGoogle } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signInWithEmail(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="login-wrap">
      <a href="#login-form" className="sr-only">Skip to content</a>
      <section className="login-left">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none', background: 'radial-gradient(circle at top left, var(--primary) 0%, transparent 40%)' }} />
        <div style={{ position: 'absolute', bottom: -96, left: -96, width: 384, height: 384, background: 'rgba(231,249,92,0.05)', borderRadius: '50%', filter: 'blur(3rem)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="row" style={{ marginBottom: 48 }}>
            <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-primary)', fontWeight: 700 }}>bolt</span>
            </div>
            <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 22, letterSpacing: '0.05em', color: 'var(--on-surface)' }}>Prepper</span>
          </div>

          <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Exam prep that <br />
            <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>actually works.</span>
          </h1>
          <p style={{ color: 'var(--on-sv)', fontSize: 16, maxWidth: 420, lineHeight: 1.6 }}>
            Practice real PYQs, build custom tests, and track progress. Free forever.
          </p>
        </div>
      </section>

      <section className="login-right" id="login-form">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Welcome Back</h2>
            <p className="text-sm">Pick up where you left off.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,113,81,0.1)', border: '1px solid rgba(255,113,81,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <button className="google-btn" onClick={handleGoogle}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="or-divider">
            <div className="or-line" />
            <span className="or-text">or email</span>
            <div className="or-line" />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="field-label">Email</label>
              <input type="email" className="login-input" placeholder="you@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="row" style={{ marginBottom: 8 }}>
                <label className="field-label" style={{ margin: 0 }}>Password</label>
                <div className="spacer" />
                <button type="button" className="forgot-link">Forgot?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="login-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-sv)', background: 'none', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <button type="submit" className="login-enter-btn" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <p className="text-sm">
              New here?{' '}
              <button style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', background: 'none', fontFamily: 'inherit', fontSize: 14 }}
                onClick={() => navigate('/signup')}
              >Create an account</button>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
