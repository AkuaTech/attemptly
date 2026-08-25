import { useEffect, useState } from 'react'

const steps = [
  { title: 'welcome to attemptly', text: 'quick 30 second tour so nothing feels lost. skip anytime, you start solving right after.' },
  { mob: '.bnav-item:nth-child(1)', desk: '.sidebar-item:nth-child(2)', title: 'mock tests', text: 'timed full tests, plus custom ones you build yourself. your exam simulation.' },
  { mob: '.bnav-item:nth-child(2)', desk: '.sidebar-item:nth-child(4)', title: 'subjects', text: 'every chapter and topic from the syllabus. pick one and start solving.' },
  { mob: '.bnav-item:nth-child(3)', desk: '.sidebar-item:nth-child(5)', title: 'planner', text: 'builds a daily plan from your weak topics. open it and just follow along.' },
  { mob: '.bnav-item:nth-child(4)', desk: '.sidebar-item:nth-child(6)', title: 'notes', text: 'notes per chapter with attachments. your own notebook inside the app.' },
  { mob: '.bnav-item:nth-child(5)', desk: '.sidebar-item:nth-child(3)', title: 'analysis', text: 'accuracy, speed and streaks. shows exactly what to fix next.' },
  { title: 'thats it', text: 'the home tab drops you straight into pyqs. everything else waits. good luck.' },
]

function findTarget(step) {
  if (!step.mob) return null
  const el = document.querySelector(window.innerWidth < 1024 ? step.mob : step.desk)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0) return null
  return r
}

export default function Tour({ onDone }) {
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState(null)

  useEffect(() => {
    const step = steps[idx]
    setRect(findTarget(step))
    const onResize = () => setRect(findTarget(steps[idx]))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [idx])

  const step = steps[idx]
  const last = idx === steps.length - 1
  const tipBelow = rect ? rect.bottom + 14 + 160 < window.innerHeight : true

  const tipStyle = rect
    ? {
        top: tipBelow ? rect.bottom + 14 : undefined,
        bottom: tipBelow ? undefined : window.innerHeight - rect.top + 14,
        left: Math.min(Math.max(16, rect.left), window.innerWidth - 316),
      }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  return (
    <>
      {rect && (
        <div
          className="tour-spot"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
        />
      )}
      <div className="tour-dim" />
      <div className="tour-tip" style={tipStyle}>
        <h4>{step.title}</h4>
        <p>{step.text}</p>
        <div className="tour-foot">
          <span className="tour-dots">
            {steps.map((_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}
          </span>
          {!last
            ? <button className="tour-skip" onClick={onDone}>skip</button>
            : null}
          <button className="tour-next" onClick={() => (last ? onDone() : setIdx(i => i + 1))}>
            {last ? 'start solving' : 'next'}
          </button>
        </div>
      </div>
    </>
  )
}
