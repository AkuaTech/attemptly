import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAQS = [
  {
    q: 'Where do the questions come from?',
    a: 'Every question is a real previous-year question from JEE Main and JEE Advanced, with worked solutions and topic tags.',
  },
  {
    q: 'How is accuracy calculated?',
    a: 'For each topic we track questions solved and questions answered correctly. Accuracy = correct / solved. Topics need at least 5 attempts before they show up in the weak-topics analysis.',
  },
  {
    q: 'How does the streak work?',
    a: 'A day counts toward your streak if you attempt at least one question. The streak counter resets after a full day with no activity.',
  },
  {
    q: 'Are my answers and progress private?',
    a: 'Yes. Row-level security means only you can read or write your own attempts and progress.',
  },
  {
    q: 'How do I report a bad question or wrong answer key?',
    a: 'Email the team at akuatech.support@gmail.com with the question id (visible during practice) — fixes go out within a couple of days.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes. Profile → Danger Zone → Delete Account. This wipes your account, attempts, progress, and preferences. There is no undo.',
  },
]

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="glass-card faq-card">
      <button
        onClick={onToggle}
        className="faq-button"
      >
        <span className="faq-question">{q}</span>
        <span className="material-symbols-outlined" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="faq-answer">
          {a}
        </div>
      )}
    </div>
  )
}

export default function Help() {
  const navigate = useNavigate()
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <button
          className="btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px', marginBottom: 20 }}
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </button>
        <h1 className="page-title">How can we <span style={{ color: 'var(--primary)' }}>help?</span></h1>
        <p className="page-sub">Common questions about practice, analytics, and your account.</p>
      </header>

      <div className="flex-col gap-12" style={{ marginBottom: 40 }}>
        {FAQS.map((f, i) => (
          <FaqItem
            key={f.q}
            q={f.q}
            a={f.a}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}
      </div>

      <div className="glass-card editorial-card help-contact-card">
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 32 }}>support_agent</span>
        <div style={{ flex: 1 }}>
          <h3 className="section-title" style={{ marginBottom: 4 }}>Still stuck?</h3>
          <p className="text-sm" style={{ color: 'var(--on-sv)' }}>
            Reach the team at <a href="mailto:akuatech.support@gmail.com" style={{ color: 'var(--primary)', fontWeight: 700 }}>akuatech.support@gmail.com</a>
            {' '}or <a href="https://github.com/akuatech/attemptly/issues/new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700 }}>create an issue on GitHub</a>.
          </p>
        </div>
        <a
          href="https://github.com/akuatech/attemptly"
          target="_blank" rel="noopener noreferrer"
          className="btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', flexShrink: 0, textDecoration: 'none' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          Star on GitHub
        </a>
      </div>
    </div>
  )
}
