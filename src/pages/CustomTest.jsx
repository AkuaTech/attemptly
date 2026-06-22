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
  { label: 'No limit', value: 0 },
  { label: '10 min', value: 10 },
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
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const { chapters, loading: chaptersLoading } = useChapters(subject)

  useEffect(() => { setChapter('') }, [subject])
  useEffect(() => {
    if (!durationManual) setDuration(Math.max(15, Math.round(size * 1.5)))
  }, [size, durationManual])

  async function handleStart() {
    if (!user) return
    setBusy(true); setError(null)
    const normalizedDifficulty = normalizeDifficulty(difficulty)
    let countQuery = supabase
      .from('jee_mains')
      .select('id', { count: 'exact', head: true })
      .eq('subject', subject)
      .eq('type', 'mcq')
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
    <div className="page-canvas" style={{ maxWidth: 640 }}>
      <header className="editorial-header">
        <div className="editorial-tag">
          <div className="line" />
          <span>New Mock</span>
        </div>
        <h1 className="page-title">Custom <span style={{ color: 'var(--primary)' }}>Test.</span></h1>
        <p className="page-sub">Build a quick test from any subject and chapter.</p>
      </header>

      <div className="glass-card editorial-card" style={{ display: 'flex', flexDirection: 'column' }}>
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

        <div className="form-row">
          <label className="text-micro">Time Limit</label>
          <div className="row gap-8 flex-wrap">
            {DURATION_OPTIONS.map(d => (
              <button
                key={d.value}
                type="button"
                className={`filter-pill ${duration === d.value ? 'active' : ''}`}
                onClick={() => { setDuration(d.value); setDurationManual(true) }}
              >
                {d.label}
              </button>
            ))}
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
    </div>
  )
}
