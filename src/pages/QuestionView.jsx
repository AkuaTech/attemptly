import { useState } from 'react'
import MathText from '../components/MathText'
import { questions } from '../data/questions'

const diffColor = { easy: 'var(--primary)', medium: '#f4a261', hard: 'var(--error)' }

function OptionButton({ opt, selected, submitted, correctId, onSelect }) {
  const isSelected = selected === opt.identifier
  const isRight = submitted && opt.identifier === correctId
  const isWrong = submitted && isSelected && opt.identifier !== correctId

  let bg = 'var(--sc-highest)'
  let border = '1px solid rgba(255,255,255,0.05)'
  let textColor = 'rgba(255,255,255,0.9)'
  let letterBg = 'var(--sc-bright)'
  let letterColor = 'var(--on-sv)'

  if (isRight) {
    bg = 'var(--primary)'; border = 'none'
    textColor = '#000'; letterBg = '#000'; letterColor = 'var(--primary)'
  } else if (isWrong) {
    bg = 'rgba(255,113,81,0.1)'; border = '1px solid rgba(255,113,81,0.4)'
  } else if (isSelected && !submitted) {
    bg = 'var(--primary)'; border = 'none'
    textColor = '#000'; letterBg = '#000'; letterColor = 'var(--primary)'
  }

  return (
    <button
      className="option-btn"
      style={{ background: bg, border, cursor: submitted ? 'default' : 'pointer' }}
      onClick={() => { if (!submitted) onSelect(opt.identifier) }}
    >
      <span className="option-letter" style={{ background: letterBg, color: letterColor }}>
        {opt.identifier}
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: 14, color: textColor, flex: 1 }}>
        <MathText>{opt.content}</MathText>
      </span>
      {isRight && <span className="material-symbols-outlined" style={{ color: '#000', fontSize: 20, flexShrink: 0 }}>check_circle</span>}
      {isWrong && <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: 20, flexShrink: 0 }}>cancel</span>}
    </button>
  )
}

export default function QuestionView() {
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answers, setAnswers] = useState({})

  const q = questions[qIdx]
  const totalQ = questions.length
  const correctId = q.correct_options[0]
  const isCorrect = submitted && selected === correctId

  function handleSubmit() {
    if (!selected) return
    setAnswers(prev => ({ ...prev, [q.id]: selected }))
    setSubmitted(true)
  }

  function goTo(idx) {
    setQIdx(idx)
    setSelected(answers[questions[idx]?.id] || null)
    setSubmitted(!!answers[questions[idx]?.id])
    setShowExplanation(false)
  }

  function next() { if (qIdx < totalQ - 1) goTo(qIdx + 1) }
  function prev() { if (qIdx > 0) goTo(qIdx - 1) }

  function clear() {
    setSelected(null)
    setSubmitted(false)
    setShowExplanation(false)
    setAnswers(prev => { const n = { ...prev }; delete n[q.id]; return n })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div className="question-toolbar">
        <div className="row" style={{ gap: 16 }}>
          <div className="q-badge">
            <span className="text-micro" style={{ color: 'var(--on-sv)' }}>Q</span>
            <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 14, color: 'var(--primary)' }}>{qIdx + 1} / {totalQ}</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-sm">{q.subject} · {q.chapter}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: diffColor[q.difficulty] ?? 'var(--muted)', padding: '2px 8px', borderRadius: 4, background: `${diffColor[q.difficulty] ?? 'var(--muted)'}18` }}>
            {q.difficulty[0].toUpperCase() + q.difficulty.slice(1)}
          </span>
          <span className="chip hide-on-mobile">{q.paper_title}</span>
        </div>
        <div className="row">
          <button
            className="toolbar-toggle"
            style={{ color: showExplanation ? 'var(--primary)' : 'var(--on-sv)' }}
            onClick={() => setShowExplanation(s => !s)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>lightbulb</span>
            Solution
          </button>
          <div className="nav-pill">
            <button onClick={prev} disabled={qIdx === 0}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={next} disabled={qIdx === totalQ - 1}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="split-pane">
        <section className="question-pane">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{ fontSize: 20, lineHeight: 1.8, color: 'var(--on-surface)', marginBottom: 40 }}>
              <MathText>{q.question}</MathText>
            </p>

            {showExplanation && submitted && (
              <div style={{
                background: isCorrect ? 'rgba(231,249,92,0.05)' : 'rgba(255,113,81,0.05)',
                border: `1px solid ${isCorrect ? 'rgba(231,249,92,0.2)' : 'rgba(255,113,81,0.2)'}`,
                borderRadius: 12, padding: 24, marginBottom: 32,
              }}>
                <div className="row" style={{ marginBottom: 16 }}>
                  <span className="material-symbols-outlined" style={{ color: isCorrect ? 'var(--primary)' : 'var(--error)', fontSize: 18 }}>
                    {isCorrect ? 'check_circle' : 'cancel'}
                  </span>
                  <span style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 13, color: isCorrect ? 'var(--primary)' : 'var(--error)' }}>
                    {isCorrect ? 'Correct!' : `Wrong — answer is (${correctId})`}
                  </span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--on-sv)' }}>
                  <MathText>{q.explanation}</MathText>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 32 }}>
              <div className="q-grid">
                {questions.map((item, idx) => {
                  const ans = answers[item.id]
                  let bg = '#18181b'
                  let color = 'var(--muted-dim, #52525b)'
                  if (idx === qIdx) { bg = 'rgba(231,249,92,0.15)'; color = 'var(--primary)' }
                  else if (ans) {
                    const right = item.correct_options[0]
                    bg = ans === right ? 'var(--primary)' : 'rgba(255,113,81,0.2)'
                    color = ans === right ? '#000' : 'var(--error)'
                  }
                  return (
                    <button
                      key={item.id}
                      className="q-grid-btn"
                      onClick={() => goTo(idx)}
                      style={{ background: bg, color, border: idx === qIdx ? '1.5px solid var(--primary)' : 'none' }}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
              <div className="row" style={{ gap: 16, fontSize: 11, color: 'var(--on-sv)' }}>
                <span className="row" style={{ gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} /> Correct</span>
                <span className="row" style={{ gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,113,81,0.4)', display: 'inline-block' }} /> Wrong</span>
                <span className="row" style={{ gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#18181b', border: '1px solid var(--primary)', display: 'inline-block' }} /> Current</span>
              </div>
            </div>
          </div>
        </section>

        <section className="options-pane">
          <div>
            <header style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 11, fontFamily: 'var(--fh)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>Select Response</h3>
              <p className="text-sm">Choose the single correct answer.</p>
            </header>

            <div>
              {q.options.map(opt => (
                <OptionButton
                  key={opt.identifier}
                  opt={opt}
                  selected={selected}
                  submitted={submitted}
                  correctId={correctId}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </div>

          <div style={{ paddingTop: 32 }}>
            {!submitted ? (
              <button
                className="submit-btn"
                style={{ marginBottom: 12, opacity: selected ? 1 : 0.4 }}
                onClick={handleSubmit}
                disabled={!selected}
              >
                Submit &amp; Check
              </button>
            ) : (
              <button
                className="submit-btn"
                style={{ marginBottom: 12, background: qIdx < totalQ - 1 ? 'var(--primary)' : 'var(--sc-high)', color: qIdx < totalQ - 1 ? 'var(--on-primary)' : 'var(--on-sv)' }}
                onClick={qIdx < totalQ - 1 ? next : undefined}
              >
                {qIdx < totalQ - 1 ? 'Next Question' : 'Session Complete'}
              </button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="btn-outline" onClick={prev} disabled={qIdx === 0} style={qIdx === 0 ? { color: '#3f3f46', cursor: 'default' } : undefined}>
                Previous
              </button>
              <button className="btn-outline" onClick={clear}>
                Clear
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
