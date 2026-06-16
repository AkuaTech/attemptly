import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { user, signUpWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState('form')
  const [confirmEmail, setConfirmEmail] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSignup(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const data = await signUpWithEmail(email, password)
      if (data.user && !data.session) {
        setConfirmEmail(email)
        setStep('confirm')
      } else {
        navigate('/dashboard')
      }
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
    <div className="onboarding-wrap">
      <a href="#signup-form" className="sr-only">Skip to content</a>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 0%, rgba(231,249,92,0.06) 0%, transparent 40%)' }} />
      </div>

      <div className="auth-brand-link">
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'none' }}>
          <div style={{ width: 40, height: 40, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--on-primary)', fontWeight: 900 }}>layers</span>
          </div>
          <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 22, color: 'var(--on-surface)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Prepper</span>
        </button>
      </div>

      {step === 'form' && (
        <div id="signup-form" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12, textAlign: 'center' }}>
            Create your <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>account</span>
          </h1>
          <p style={{ color: 'var(--on-sv)', fontSize: 15, textAlign: 'center', marginBottom: 40 }}>
            Takes 30 seconds. No credit card.
          </p>

          {error && (
            <div style={{ background: 'rgba(255,113,81,0.1)', border: '1px solid rgba(255,113,81,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <button className="google-btn" onClick={handleGoogle} style={{ marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="or-divider">
            <div className="or-line" />
            <span className="or-text">or email</span>
            <div className="or-line" />
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label">Email</label>
              <input type="email" className="login-input" placeholder="you@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" className="login-input" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="login-enter-btn" disabled={busy}>
              {busy ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--on-sv)', fontSize: 14 }}>
            Already have an account?{' '}
            <button style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', background: 'none', fontFamily: 'inherit', fontSize: 14 }} onClick={() => navigate('/login')}>
              Sign in
            </button>
          </p>
        </div>
      )}

      {step === 'confirm' && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 8, background: 'rgba(231,249,92,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--primary)' }}>mark_email_read</span>
          </div>
          <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 36, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Check your email
          </h1>
          <p style={{ color: 'var(--on-sv)', fontSize: 16, lineHeight: 1.6, marginBottom: 12 }}>
            We sent a confirmation link to
          </p>
          <p style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18, color: 'var(--primary)', marginBottom: 32, wordBreak: 'break-all' }}>
            {confirmEmail}
          </p>
          <p style={{ color: 'var(--on-sv)', fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 40px' }}>
            Click the link in the email to verify your account, then come back and sign in.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
            <button className="login-enter-btn" style={{ margin: 0 }} onClick={() => navigate('/login')}>
              Go to Sign In
            </button>
            <button
              style={{ padding: '12px', color: 'var(--on-sv)', fontSize: 13, fontFamily: 'var(--fh)', fontWeight: 600, cursor: 'pointer', background: 'none' }}
              onClick={() => { setStep('form'); setError(null) }}
            >
              Use a different email
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
