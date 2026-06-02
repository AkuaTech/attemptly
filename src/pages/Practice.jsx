import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import MathText from '../components/MathText'
import { slugToTitle } from '../lib/slug'
import {
  dedupeAttemptsByQuestion,
  displayDifficulty,
  getMockQuestionLimit,
  normalizeDifficulty,
  shouldFilterMockDifficulty,
} from '../lib/mockContract'

const DIAGNOSTIC_COUNT = 15
const DEFAULT_PRACTICE_LIMIT = 20

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function correctIdentifier(q) {
  const arr = Array.isArray(q.correct_options) ? q.correct_options : []
  return arr[0] || null
}

async function loadMockTest(mockId) {
  const { data, error } = await supabase
    .from('mock_tests')
    .select('*')
    .eq('id', mockId)
    .maybeSingle()
  if (error) throw error
  return data
}

async function loadExistingMockAnswers(mockAttemptId) {
  const { data, error } = await supabase
    .from('user_attempts')
    .select('question_id, selected_option, is_correct, time_spent_ms, subject, chapter, topic, attempted_at')
    .eq('mock_attempt_id', mockAttemptId)
    .order('attempted_at', { ascending: true })
  if (error) throw error
  return dedupeAttemptsByQuestion(data || [])
}

async function finalizeMockAttempt(attemptId, totalCount) {
  const { data: rows, error: rErr } = await supabase
    .from('user_attempts')
    .select('question_id, is_correct, time_spent_ms, attempted_at')
    .eq('mock_attempt_id', attemptId)
    .order('attempted_at', { ascending: true })
  if (rErr) throw rErr
  const all = dedupeAttemptsByQuestion(rows || [])
  const correctCount = all.filter(a => a.is_correct).length
  const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0
  const timeSpentMs = all.reduce((s, a) => s + (Number(a.time_spent_ms) || 0), 0)
  const { data: updated, error: uErr } = await supabase
    .from('mock_test_attempts')
    .update({
      status: 'completed',
      score,
      correct_count: correctCount,
      total_count: totalCount,
      time_spent_ms: timeSpentMs,
      completed_at: new Date().toISOString(),
    })
    .eq('id', attemptId)
    .select('*')
    .single()
  if (uErr) throw uErr
  return updated
}

async function syncAttemptTotal(attempt, totalCount) {
  if (!attempt || attempt.status !== 'started' || attempt.total_count === totalCount) {
    return attempt
  }
  const { data, error } = await supabase
    .from('mock_test_attempts')
    .update({ total_count: totalCount })
    .eq('id', attempt.id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

async function loadAttemptById({ attemptId, mockId, userId }) {
  if (!attemptId) return null
  const { data, error } = await supabase
    .from('mock_test_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('mock_test_id', mockId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

async function loadOrCreateAttempt({ mockId, userId, totalCount }) {
  const actualTotal = Math.max(1, Number(totalCount) || 0)
  const { data: existing } = await supabase
    .from('mock_test_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('mock_test_id', mockId)
    .eq('status', 'started')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (existing) return syncAttemptTotal(existing, actualTotal)
  const { data, error } = await supabase
    .from('mock_test_attempts')
    .insert({ user_id: userId, mock_test_id: mockId, total_count: actualTotal })
    .select('*')
    .single()
  if (error) throw error
  return data
}

async function createOrUpdateMockAnswer(answer) {
  const { error } = await supabase
    .from('user_attempts')
    .upsert(answer, { onConflict: 'mock_attempt_id,question_id' })
  if (error) throw error
}

async function loadQuestions({ mode, mock, subject, chapter, topic }) {
  let query = supabase
    .from('jee_mains')
    .select('id, subject, chapter, topic, difficulty, question, options, correct_options, explanation')
    .eq('type', 'mcq')
    .eq('is_out_of_syllabus', false)

  if (mode === 'mock' && mock) {
    if (mock.subject) query = query.eq('subject', mock.subject)
    if (mock.chapter) query = query.eq('chapter', mock.chapter)
    if (mock.topic) query = query.eq('topic', mock.topic)
    if (shouldFilterMockDifficulty(mock)) {
      query = query.eq('difficulty', normalizeDifficulty(mock.difficulty))
    }
    query = query.order('id', { ascending: true }).limit(getMockQuestionLimit(mock))
  } else if (mode === 'diagnostic') {
    query = query.order('id', { ascending: true }).limit(2000)
  } else {
    if (subject) query = query.eq('subject', subject)
    if (chapter) query = query.eq('chapter', chapter)
    if (topic) query = query.eq('topic', topic)
    query = query.order('id', { ascending: true }).limit(DEFAULT_PRACTICE_LIMIT)
  }

  const { data, error } = await query
  if (error) throw error
  let rows = data || []

  if (mode === 'diagnostic') {
    // Pick a balanced random sample across subjects.
    const bySubject = new Map()
    for (const r of rows) {
      if (!bySubject.has(r.subject)) bySubject.set(r.subject, [])
      bySubject.get(r.subject).push(r)
    }
    const picked = []
    const subjects = [...bySubject.keys()]
    const perSubject = Math.ceil(DIAGNOSTIC_COUNT / Math.max(1, subjects.length))
    for (const s of subjects) {
      const pool = bySubject.get(s)
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));[pool[i], pool[j]] = [pool[j], pool[i]]
      }
      picked.push(...pool.slice(0, perSubject))
    }
    rows = picked.slice(0, DIAGNOSTIC_COUNT)
  }
  return rows
}

export default function Practice() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [params] = useSearchParams()

  const mockId = params.get('mock')
  const attemptIdParam = params.get('attempt')
  const isDiagnostic = params.get('diagnostic') === '1'
  const subject = params.get('subject')
  const chapter = params.get('chapter')
  const topic = params.get('topic')
  const mode = mockId ? 'mock' : isDiagnostic ? 'diagnostic' : 'practice'

  const [loadState, setLoadState] = useState({ loading: true, error: null })
  const [mock, setMock] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [showSummary, setShowSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const startedAtRef = useRef(Date.now())
  const questionStartedAtRef = useRef(Date.now())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        let mockRow = null
        let attemptRow = null
        let qs = []
        if (mode === 'mock') {
          mockRow = await loadMockTest(mockId)
          if (!mockRow) throw new Error('Mock test not found.')
          attemptRow = await loadAttemptById({ attemptId: attemptIdParam, mockId, userId: user.id })
          if (attemptRow?.status === 'completed') {
            if (!cancelled) {
              setMock(mockRow); setAttempt(attemptRow); setShowSummary(true)
              setLoadState({ loading: false, error: null })
            }
            return
          }
          qs = await loadQuestions({ mode, mock: mockRow, subject, chapter, topic })
          if (qs.length === 0) {
            throw new Error('No questions match this mock test. Try a broader custom test or choose another mock.')
          }
          attemptRow = attemptRow
            ? await syncAttemptTotal(attemptRow, qs.length)
            : await loadOrCreateAttempt({ mockId, userId: user.id, totalCount: qs.length })
          startedAtRef.current = new Date(attemptRow.started_at).getTime()
        } else {
          qs = await loadQuestions({ mode, mock: mockRow, subject, chapter, topic })
        }
        if (cancelled) return

        let resumedAnswers = {}
        let resumeIdx = 0
        let finalizedAttempt = null
        if (mode === 'mock' && attemptRow) {
          const existing = await loadExistingMockAnswers(attemptRow.id)
          for (const a of existing) {
            resumedAnswers[a.question_id] = {
              selected: a.selected_option,
              isCorrect: a.is_correct,
              timeSpentMs: a.time_spent_ms,
              subject: a.subject, chapter: a.chapter, topic: a.topic,
            }
          }
          if (existing.length > 0) {
            const nextIdx = qs.findIndex(q => !(q.id in resumedAnswers))
            if (nextIdx === -1) {
              // Every question already answered but the attempt is still 'started' —
              // a previous finalize must have failed. Finalize now and show summary.
              finalizedAttempt = await finalizeMockAttempt(attemptRow.id, qs.length)
            } else {
              resumeIdx = nextIdx
            }
          }
        }
        if (cancelled) return

        setMock(mockRow)
        setAttempt(finalizedAttempt || attemptRow)
        setQuestions(qs)
        setAnswers(resumedAnswers)
        setIdx(resumeIdx)
        if (finalizedAttempt) setShowSummary(true)
        questionStartedAtRef.current = Date.now()
        setLoadState({ loading: false, error: null })
      } catch (err) {
        if (!cancelled) setLoadState({ loading: false, error: err })
      }
    }
    if (user) run()
    return () => { cancelled = true }
  }, [user, mode, mockId, attemptIdParam, subject, chapter, topic])

  // Tick the timer in mock mode
  useEffect(() => {
    if (mode !== 'mock' || !mock || showSummary) return
    const t = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(t)
  }, [mode, mock, showSummary])

  const remainingMs = useMemo(() => {
    if (mode !== 'mock' || !mock) return 0
    const totalMs = (mock.duration_minutes || 60) * 60 * 1000
    const elapsed = Date.now() - startedAtRef.current
    return Math.max(0, totalMs - elapsed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, mock, tick])

  const finishMock = useFinishMock({
    mock, attempt, questions, setAttempt, setShowSummary, setSubmitting, setLoadState,
  })

  useEffect(() => {
    if (mode !== 'mock' || !mock || showSummary || submitting) return
    if (remainingMs <= 0) finishMock()
  }, [mode, mock, remainingMs, showSummary, submitting, finishMock])

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  if (loadState.loading) {
    return (
      <div className="practice-wrap">
        <p className="text-muted text-sm">Loading questions…</p>
      </div>
    )
  }

  if (loadState.error) {
    return (
      <div className="practice-wrap">
        <p className="form-error">{loadState.error.message}</p>
        <button className="btn-outline" style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, alignSelf: 'flex-start' }} onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  if (showSummary) {
    return <Summary
      mode={mode}
      mock={mock}
      attempt={attempt}
      questions={questions}
      answers={answers}
      onClose={() => navigate(mode === 'mock' ? '/tests' : '/dashboard')}
    />
  }

  if (questions.length === 0) {
    return (
      <div className="practice-wrap">
        <p className="text-muted text-sm">
          No questions match this filter. Try a broader chapter or subject.
        </p>
        <button className="btn-outline" style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, alignSelf: 'flex-start' }} onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  const q = questions[idx]
  const correct = correctIdentifier(q)
  const isLast = idx === questions.length - 1

  async function handleSubmit() {
    if (!selected || submitting) return
    setSubmitting(true)
    const elapsed = Math.min(10 * 60 * 1000, Date.now() - questionStartedAtRef.current)
    const isCorrect = selected === correct

    if (mode !== 'mock') {
      const { error } = await supabase.from('user_attempts').insert({
        user_id: user.id,
        question_id: q.id,
        subject: q.subject, chapter: q.chapter, topic: q.topic,
        selected_option: selected,
        is_correct: isCorrect,
        time_spent_ms: elapsed,
      })
      if (error) { setLoadState({ loading: false, error }); setSubmitting(false); return }
    }

    setAnswers(prev => ({
      ...prev,
      [q.id]: { selected, isCorrect, timeSpentMs: elapsed, subject: q.subject, chapter: q.chapter, topic: q.topic },
    }))
    setSubmitted(true)
    setSubmitting(false)
  }

  function handleNext() {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setSelected(null)
      setSubmitted(false)
      questionStartedAtRef.current = Date.now()
    } else {
      if (mode === 'mock') finishMock()
      else setShowSummary(true)
    }
  }

  async function handleMockNext() {
    if (!selected || submitting || !attempt) return
    setSubmitting(true)
    const elapsed = Math.min(30 * 60 * 1000, Date.now() - questionStartedAtRef.current)
    const isCorrect = selected === correct
    const attemptedAt = new Date().toISOString()

    // Persist this answer immediately so a refresh / tab-close can resume from
    // here, and so attempted_at reflects when the work actually happened
    // rather than when the whole mock is submitted.
    try {
      await createOrUpdateMockAnswer({
        user_id: user.id,
        mock_attempt_id: attempt.id,
        question_id: q.id,
        subject: q.subject, chapter: q.chapter, topic: q.topic,
        selected_option: selected,
        is_correct: isCorrect,
        time_spent_ms: elapsed,
        attempted_at: attemptedAt,
      })
    } catch (error) {
      setLoadState({ loading: false, error })
      setSubmitting(false)
      return
    }

    setAnswers(prev => ({
      ...prev,
      [q.id]: { selected, isCorrect, timeSpentMs: elapsed, subject: q.subject, chapter: q.chapter, topic: q.topic },
    }))

    if (isLast) {
      await finishMock()
    } else {
      setIdx(idx + 1)
      setSelected(null)
      questionStartedAtRef.current = Date.now()
      setSubmitting(false)
    }
  }

  const headerLabel = mode === 'mock'
    ? mock?.title
    : mode === 'diagnostic'
      ? 'Diagnostic Test'
      : [subject, chapter && slugToTitle(chapter), topic && slugToTitle(topic)].filter(Boolean).join(' · ')

  return (
    <div className="practice-wrap">
      <div className="practice-bar">
        <button className="practice-close" onClick={() => navigate(-1)} aria-label="Close">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="practice-progress" aria-label={`Question ${idx + 1} of ${questions.length}`}>
          <div className="practice-progress-fill" style={{ width: `${((idx + (submitted ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <div className="practice-progress-text">
          {idx + 1} / {questions.length}
        </div>
        {mode === 'mock' && (
          <div className={`practice-timer ${remainingMs < 60_000 ? 'warn' : ''}`} aria-label="Time remaining">
            {formatClock(remainingMs)}
          </div>
        )}
      </div>

      <div className="practice-meta">
        {headerLabel}
        {q.difficulty && <span style={{ marginLeft: 12, color: 'var(--primary)' }}>· {displayDifficulty(q.difficulty)}</span>}
      </div>

      <div className="question-card">
        <MathText>{q.question}</MathText>

        <div className="option-list">
          {(q.options || []).map(opt => {
            const isSelected = selected === opt.identifier
            const showCorrectness = mode !== 'mock' && submitted
            const isCorrect = showCorrectness && opt.identifier === correct
            const isWrong = showCorrectness && isSelected && opt.identifier !== correct
            return (
              <button
                key={opt.identifier}
                className={`option-chip ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => !submitted && setSelected(opt.identifier)}
                disabled={submitted}
              >
                <span className="option-letter">{opt.identifier}</span>
                <MathText style={{ flex: 1 }}>{opt.content}</MathText>
              </button>
            )
          })}
        </div>

        {mode !== 'mock' && submitted && q.explanation && (
          <div className="explanation-card">
            <h4>Explanation</h4>
            <MathText>{q.explanation}</MathText>
          </div>
        )}
      </div>

      <div className="practice-actions">
        {mode === 'mock' ? (
          <button className="submit-btn" disabled={!selected || submitting} onClick={handleMockNext}>
            {isLast ? (submitting ? 'Submitting…' : 'Submit Test') : 'Next'}
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        ) : !submitted ? (
          <button className="submit-btn" disabled={!selected || submitting} onClick={handleSubmit}>
            {submitting ? 'Saving…' : 'Submit'}
          </button>
        ) : (
          <button className="submit-btn" onClick={handleNext}>
            {isLast ? 'Finish' : 'Next Question'}
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  )
}

function useFinishMock({ mock, attempt, questions, setAttempt, setShowSummary, setSubmitting, setLoadState }) {
  return async function finish() {
    if (!mock || !attempt) return
    setSubmitting(true)
    try {
      const updated = await finalizeMockAttempt(attempt.id, questions.length)
      if (updated) setAttempt(updated)
      setShowSummary(true)
    } catch (err) {
      setLoadState({ loading: false, error: err })
    } finally {
      setSubmitting(false)
    }
  }
}

function Summary({ mode, mock, attempt, questions, answers, onClose }) {
  const navigate = useNavigate()
  const isCompletedMock = mode === 'mock' && attempt?.status === 'completed'
  const total = isCompletedMock
    ? (attempt.total_count || questions.length)
    : (questions.length || attempt?.total_count || 0)
  const correct = isCompletedMock
    ? (attempt.correct_count || 0)
    : Object.values(answers).filter(a => a.isCorrect).length
  const accuracy = total > 0 ? (correct / total) * 100 : 0
  const totalTimeMs = isCompletedMock
    ? Number(attempt.time_spent_ms || 0)
    : Object.values(answers).reduce((s, a) => s + (a.timeSpentMs || 0), 0)
  const avgSec = total > 0 ? totalTimeMs / total / 1000 : 0

  return (
    <div className="practice-wrap">
      <div className="summary-card">
        <p className="text-micro" style={{ marginBottom: 16 }}>
          {mode === 'mock' ? mock?.title : mode === 'diagnostic' ? 'Diagnostic Complete' : 'Set Complete'}
        </p>
        <div className="summary-score">{accuracy.toFixed(0)}<span style={{ fontSize: 32 }}>%</span></div>
        <p className="text-sm" style={{ marginTop: 8, color: 'var(--on-sv)' }}>
          {correct} of {total} correct
        </p>

        <div className="summary-stats">
          <div>
            <div className="summary-stat-label">Correct</div>
            <div className="summary-stat-value" style={{ color: 'var(--primary)' }}>{correct}</div>
          </div>
          <div>
            <div className="summary-stat-label">Wrong</div>
            <div className="summary-stat-value" style={{ color: 'var(--error)' }}>{total - correct}</div>
          </div>
          <div>
            <div className="summary-stat-label">Avg / Q</div>
            <div className="summary-stat-value">{avgSec > 0 ? `${avgSec.toFixed(0)}s` : '—'}</div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-outline" style={{ padding: '12px 20px', borderRadius: 10 }} onClick={() => navigate('/analytics')}>
            View Analytics
          </button>
          <button className="submit-btn" style={{ width: 'auto', padding: '12px 24px' }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
