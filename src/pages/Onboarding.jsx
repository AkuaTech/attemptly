import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'

const features = [
  { icon: 'menu_book', title: 'Real PYQs', desc: 'Every question is pulled from an actual previous-year paper, with a fully worked solution. No filler, no AI-invented problems.', size: 'xl' },
  { icon: 'insights', title: 'Deep Analytics', desc: 'Accuracy trends, a consistency heatmap, subject split and speed tracking, so you always know what to fix next.', size: 'wide' },
  { icon: 'quiz', title: 'Custom Mock Tests', desc: 'Pick subject, chapter, difficulty and length. The test builds itself.' },
  { icon: 'psychology', title: 'Diagnostic Test', desc: 'A 15-minute cross-subject check that maps your starting point.' },
  { icon: 'functions', title: 'LaTeX Rendering', desc: 'Crisp KaTeX equations. Never a blurry screenshot.' },
  { icon: 'note_alt', title: 'Study Notes', desc: 'Rich-text notes with attachments, tagged by chapter.' },
  { icon: 'event', title: 'Daily Schedule', desc: 'A plan generated from your weak topics and resume queue.' },
  { icon: 'replay', title: 'Test Review', desc: 'Replay any test question-by-question with explanations.' },
]

const steps = [
  { step: '01', title: 'Pick a subject', desc: 'Physics, Chemistry, or Mathematics. Start anywhere.' },
  { step: '02', title: 'Solve PYQs', desc: 'Real exam questions, instant feedback, worked solutions.' },
  { step: '03', title: 'Track progress', desc: 'Accuracy, speed and weak topics at a glance.' },
  { step: '04', title: 'Drill weak areas', desc: 'Auto-built practice from your lowest-scoring topics.' },
]

function formatPyqCount(n) {
  if (!n) return '—'
  const floored = Math.floor(n / 100) * 100
  return floored.toLocaleString() + '+'
}

const subjects = [
  { icon: 'rocket_launch', label: 'Physics' },
  { icon: 'science', label: 'Chemistry' },
  { icon: 'functions', label: 'Mathematics' },
]

const glyphs = [
  { ch: '∫', top: '12%', left: '8%', size: 150 },
  { ch: 'Σ', top: '52%', left: '60%', size: 190 },
  { ch: 'π', top: '6%', left: '68%', size: 120 },
  { ch: '√', top: '64%', left: '14%', size: 130 },
  { ch: 'Δ', top: '34%', left: '36%', size: 110 },
]

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = root.querySelectorAll('[data-reveal]')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('is-revealed'))
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    targets.forEach(t => io.observe(t))
    return () => io.disconnect()
  }, [])
  return ref
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const ref = useReveal()
  const [liveCounts, setLiveCounts] = useState({ pyqs: null, subjects: null })

  useEffect(() => {
    async function fetchCounts() {
      const [{ count: pyqCount }, { data: subjectRows }] = await Promise.all([
        supabase.from('jee_mains').select('*', { count: 'exact', head: true }),
        supabase.from('jee_mains').select('subject').limit(100),
      ])
      const subjectCount = subjectRows ? new Set(subjectRows.map(r => r.subject)).size : null
      setLiveCounts({ pyqs: pyqCount, subjects: subjectCount })
    }
    fetchCounts()
  }, [])

  const displayStats = [
    { value: liveCounts.pyqs !== null ? formatPyqCount(liveCounts.pyqs) : '—', label: 'PYQs' },
    { value: liveCounts.subjects !== null ? String(liveCounts.subjects) : '—', label: 'Subjects' },
    { value: '100%', label: 'Free' },
    { value: '0', label: 'Ads' },
  ]

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="lp" ref={ref}>
      <a href="#lp-main" className="sr-only">Skip to content</a>
      <div className="lp-atmos" aria-hidden="true" />

      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-brand">
            <div className="lp-brand-mark">
              <span className="material-symbols-outlined">layers</span>
            </div>
            <span className="lp-brand-text">Prepper</span>
          </div>
          <div className="lp-nav-actions">
            <a className="lp-nav-link" href="https://github.com/akuatech/prepper" target="_blank" rel="noopener noreferrer">GitHub</a>
            <button className="lp-nav-signin" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
      </nav>

      <main id="lp-main" className="lp-shell">
        <header className="lp-hero">
          <div className="lp-hero-copy">
            <div className="lp-eyebrow" data-reveal>
              <span className="lp-eyebrow-dot" />
              JEE Main &amp; Advanced · Prep Platform
            </div>
            <h1 className="lp-title" data-reveal>
              Stop guessing.
              <span className="lp-title-accent">Start solving.</span>
            </h1>
            <p className="lp-sub" data-reveal>
              Real previous-year questions, custom mock tests, and analytics that
              tell you exactly what to fix. One focused platform, zero noise.
            </p>
            <div className="lp-hero-cta" data-reveal>
              <button className="lp-btn-primary" onClick={() => navigate('/signup')}>
                Get Started
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="lp-btn-ghost" onClick={() => navigate('/login')}>
                I have an account
              </button>
            </div>
          </div>

          <div className="lp-hero-art" aria-hidden="true">
            <div className="lp-hero-ring">
              <span className="lp-hero-ring-num">92%</span>
              <span className="lp-hero-ring-label">accuracy</span>
            </div>
            {glyphs.map((g, i) => (
              <span
                key={i}
                className="lp-glyph"
                style={{ top: g.top, left: g.left, fontSize: g.size, animationDelay: `${i * 0.4}s` }}
              >
                {g.ch}
              </span>
            ))}
          </div>
        </header>

        <section className="lp-section">
          <div className="lp-section-head" data-reveal>
            <span className="lp-kicker">01 · Features</span>
            <h2 className="lp-section-title">Everything you need. Nothing you don't.</h2>
          </div>
          <div className="lp-bento">
            {features.map((f, i) => (
              <article
                key={f.title}
                className={`lp-feat lp-feat-${f.size || 'sm'}`}
                data-reveal
                style={{ transitionDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <div className="lp-feat-icon">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <div className="lp-feat-body">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-section-head" data-reveal>
            <span className="lp-kicker">02 · Workflow</span>
            <h2 className="lp-section-title">How it works</h2>
          </div>
          <ol className="lp-steps">
            <div className="lp-steps-line" aria-hidden="true" />
            {steps.map((s, i) => (
              <li key={s.step} className="lp-step" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="lp-step-node">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-section">
          <div className="lp-builtfor" data-reveal>
            <div className="lp-builtfor-copy">
              <span className="lp-kicker">03 · Coverage</span>
              <h2 className="lp-section-title">Built for JEE.</h2>
              <p className="lp-builtfor-text">
                Full Physics, Chemistry and Mathematics coverage for JEE Main &amp; Advanced.
                Every chapter, mapped to the real syllabus.
              </p>
              <span className="lp-soon">More exams coming soon</span>
            </div>
            <div className="lp-subjects">
              {subjects.map(s => (
                <div key={s.label} className="lp-subject">
                  <span className="material-symbols-outlined">{s.icon}</span>
                  <span className="lp-subject-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-final" data-reveal>
            <div className="lp-final-glow" aria-hidden="true" />
            <h2 className="lp-final-title">Ready to start solving?</h2>
            <p className="lp-final-sub">Free account. No credit card, no ads, no premium tier, ever.</p>
            <button className="lp-btn-primary lp-btn-lg" onClick={() => navigate('/signup')}>
              Create free account
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

        <footer className="lp-footer">
          <div className="lp-brand">
            <div className="lp-brand-mark lp-brand-mark-sm">
              <span className="material-symbols-outlined">layers</span>
            </div>
            <span className="lp-brand-text lp-brand-text-sm">Prepper</span>
          </div>
          <div className="lp-footer-links">
            <a href="https://akuatech.github.io" target="_blank" rel="noopener noreferrer">Made by Akuatech</a>
            <span className="lp-footer-sep">·</span>
            <a href="https://github.com/akuatech/prepper" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <p className="lp-footer-copy">Open source · Free forever · No tracking</p>
        </footer>
      </main>
    </div>
  )
}
