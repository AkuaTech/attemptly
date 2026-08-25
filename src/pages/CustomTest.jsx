import { ArrowLeft, PencilSimple, X } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import { useChapters } from '../hooks/useTaxonomy'
import { slugToTitle } from '../lib/slug'
import { MOCK_DIFFICULTIES, displayDifficulty, normalizeDifficulty } from '../lib/mockContract'

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics']
const SIZES = [10, 20, 30]
const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '90 min', value: 90 },
]

export default function CustomTest() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [subject, setSubject] = useState('Physics')
  const [chapter, setChapter] = useState('')
  const [size, setSize] = useState(20)
  const [difficulty, setDifficulty] = useState('medium')
  const [duration, setDuration] = useState(30)
  const [durationManual, setDurationManual] = useState(false)
  const [customActive, setCustomActive] = useState(false)
  const [customVal, setCustomVal] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { chapters, loading: chaptersLoading } = useChapters(subject)

  useEffect(() => { setChapter('') }, [subject])
  useEffect(() => {
    if (!durationManual) setDuration(Math.max(15, Math.round(size * 1.5)))
  }, [size, durationManual])

  async function handleStart() {
    if (!user) return
    setShowConfirm(true)
  }

  async function confirmStart() {
    setShowConfirm(false)
    setBusy(true); setError(null)
    const normalizedDifficulty = normalizeDifficulty(difficulty)
    let countQuery = supabase
      .from('jee_mains')
      .select('id', { count: 'exact', head: true })
      .eq('subject', subject)
      .in('type', ['mcq', 'integer'])
      .eq('is_out_of_syllabus', false)
      .eq('difficulty', normalizedDifficulty)
    if (chapter) countQuery = countQuery.eq('chapter', chapter)
    const { count, error: countErr } = await countQuery
    if (countErr) { setError(countErr); setBusy(false); return }
    if ((count || 0) < size) {
      setError(new Error(`Only ${count || 0} ${displayDifficulty(normalizedDifficulty)} questions match this selection. Choose a smaller or broader test.`))
      setBusy(false)
      return
    }
    const title = `Custom · ${subject}${chapter ? ` · ${slugToTitle(chapter)}` : ''} · ${size}q`
    const { data: test, error: tErr } = await supabase
      .from('mock_tests')
      .insert({
        title, pattern: 'Custom Test',
        num_questions: size, duration_minutes: duration || null,
        difficulty: normalizedDifficulty, subject, chapter: chapter || null,
        is_official: false, created_by: user.id,
      })
      .select('id')
      .single()
    if (tErr) { setError(tErr); setBusy(false); return }
    const { data: attempt, error: aErr } = await supabase
      .from('mock_test_attempts')
      .insert({ user_id: user.id, mock_test_id: test.id, total_count: size })
      .select('id')
      .single()
    if (aErr) { setError(aErr); setBusy(false); return }
    navigate(`/practice?mock=${test.id}&attempt=${attempt.id}`)
  }

  return (
    <div className="page-canvas">
      <header className="editorial-header">
        <button
          className="btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px', marginBottom: 20 }}
          onClick={() => navigate('/tests')}
        >
          <ArrowLeft size={16} />
          Tests
        </button>
        <h1 className="page-title">Custom <span style={{ color: 'var(--primary)' }}>Test.</span></h1>
        <p className="page-sub">Build a quick test from any subject and chapter.</p>
      </header>

      <div className="glass-card" style={{ padding: '36px 44px', maxWidth: 800 }}>
        <div className="custom-grid">
          <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-row">
              <label className="text-micro">Subject</label>
              <select className="form-select" value={subject} onChange={e => setSubject(e.target.value)}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-row">
              <label className="text-micro">Chapter (optional)</label>
              <select className="form-select" value={chapter} onChange={e => setChapter(e.target.value)} disabled={chaptersLoading}>
                <option value="">{chaptersLoading ? 'Loading…' : 'Whole subject'}</option>
                {chapters.map(c => <option key={c.slug} value={c.slug}>{slugToTitle(c.slug)} ({c.count})</option>)}
              </select>
            </div>

            <div className="form-row">
              <label className="text-micro">Number of questions</label>
              <div className="row gap-8">
                {SIZES.map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`filter-pill ${size === n ? 'active' : ''}`}
                    onClick={() => setSize(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <label className="text-micro">Difficulty</label>
              <div className="row gap-8">
                {MOCK_DIFFICULTIES.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    className={`filter-pill ${difficulty === d.value ? 'active' : ''}`}
                    onClick={() => setDifficulty(d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-row">
              <label className="text-micro">
                Time Limit
                <span style={{ marginLeft: 8, color: 'var(--on-sv)', fontWeight: 400, fontSize: 11 }}>
                  {customActive ? (customVal ? `${customVal} min` : '—') : `${duration} min`}
                </span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    style={{
                      padding: '9px 4px',
                      borderRadius: 8,
                      border: `1.5px solid ${!customActive && duration === d.value ? 'var(--primary)' : 'var(--outline)'}`,
                      background: !customActive && duration === d.value ? 'var(--primary-faint)' : 'transparent',
                      color: !customActive && duration === d.value ? 'var(--primary)' : 'var(--on-sv)',
                      fontFamily: 'var(--fh)',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'border-color 150ms, background 150ms, color 150ms',
                    }}
                    onClick={() => { setDuration(d.value); setDurationManual(true); setCustomActive(false); setCustomVal('') }}
                  >
                    {d.label}
                  </button>
                ))}
                <button
                  type="button"
                  style={{
                    padding: '9px 4px',
                    borderRadius: 8,
                    border: `1.5px solid ${customActive ? 'var(--primary)' : 'var(--outline)'}`,
                    background: customActive ? 'var(--primary-faint)' : 'transparent',
                    color: customActive ? 'var(--primary)' : 'var(--on-sv)',
                    fontFamily: 'var(--fh)',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'border-color 150ms, background 150ms, color 150ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                  }}
                  onClick={() => { setCustomActive(true); setDurationManual(true); setCustomVal('') }}
                >
                  <PencilSimple size={13} />
                  Custom
                </button>
              </div>
              {customActive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--primary)', background: 'var(--primary-faint)' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 25"
                    value={customVal}
                    autoFocus
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '')
                      setCustomVal(raw)
                      const n = parseInt(raw, 10)
                      if (n > 0 && n <= 300) setDuration(n)
                    }}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--primary)', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, minWidth: 0 }}
                  />
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>min</span>
                </div>
              )}
            </div>

            <div className="form-row" style={{ marginTop: 'auto' }}>
              <label className="text-micro">Summary</label>
              <div className="glass-card" style={{ padding: 16, borderRadius: 12, background: 'var(--sc-high)' }}>
                <div className="row gap-16" style={{ justifyContent: 'space-around' }}>
                  <div className="text-center">
                    <div className="text-black" style={{ fontFamily: 'var(--fh)', fontSize: 20, color: 'var(--primary)' }}>{size}</div>
                    <div className="text-micro" style={{ fontSize: 9 }}>Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-black" style={{ fontFamily: 'var(--fh)', fontSize: 20, color: 'var(--primary)' }}>{duration}min</div>
                    <div className="text-micro" style={{ fontSize: 9 }}>Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-black" style={{ fontFamily: 'var(--fh)', fontSize: 20, color: 'var(--primary)' }}>{subject.slice(0, 4)}</div>
                    <div className="text-micro" style={{ fontSize: 9 }}>Subject</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="form-error" style={{ marginTop: 16 }}>{error.message}</p>}

        <div className="row" style={{ marginTop: 24, gap: 12 }}>
          <button className="btn-outline" style={{ padding: '12px 16px', borderRadius: 10 }} onClick={() => navigate('/tests')}>
            Cancel
          </button>
          <div className="spacer" />
          <button className="login-enter-btn" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={handleStart} disabled={busy}>
            {busy ? 'Starting…' : 'Start Test'}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="modal-card" style={{ maxWidth: 400 }}>
            <div className="modal-head">
              <h3 className="modal-title">Start Test?</h3>
              <button className="modal-close" onClick={() => setShowConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm" style={{ margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to start this custom test? This will begin a timed session with <strong>{size} questions</strong>.
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-start" onClick={confirmStart}>Start Test</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
