import { useState } from 'react'

const FAQS = [
  {
    q: 'Where do the questions come from?',
    a: 'Every question is a real previous-year question from JEE Main, JEE Advanced, or NEET, with full step-by-step solutions and topic tags.',
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
    a: 'Email the team at hello@prepper.example with the question id (visible during practice) — fixes go out within a couple of days.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes. Profile → Danger Zone → Delete Account. This wipes your account, attempts, progress, and preferences. There is no undo.',
  },
]

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="glass-card" style={{ borderRadius: 16, padding: 0, overflow: 'hidden', border: '0.5px solid rgba(72,72,71,0.15)' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', background: 'transparent' }}
      >
        <span style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15 }}>{q}</span>
        <span className="material-symbols-outlined" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
          expand_more
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 24px 20px', color: 'var(--on-sv)', fontSize: 14, lineHeight: 1.6 }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function Help() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <div className="editorial-tag">
          <div className="line" />
          <span>Help & Support</span>
        </div>
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

      <div className="glass-card editorial-card" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 32 }}>support_agent</span>
        <div style={{ flex: 1 }}>
          <h3 className="section-title" style={{ marginBottom: 4 }}>Still stuck?</h3>
          <p className="text-sm" style={{ color: 'var(--on-sv)' }}>
            Reach the team at <a href="mailto:hello@prepper.example" style={{ color: 'var(--primary)', fontWeight: 700 }}>hello@prepper.example</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
