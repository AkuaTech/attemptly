import { ArrowLeft, ArrowRight, Flag, SkipForward, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import MathText from '../components/MathText'
import Modal from '../components/Modal'
import TestAnalyticsView from '../components/TestAnalyticsView'
import { computeTestAnalytics } from '../lib/testAnalytics'
import { slugToTitle } from '../lib/slug'
import { SkeletonPractice } from '../components/Skeleton'
import { dedupeAttemptsByQuestion, displayDifficulty } from '../lib/mockContract'
import { loadMockQuestionSet } from '../lib/mockQuestionSet'
import {
  checkAnswer,
  correctDisplay,
  correctOption,
  isNumerical,
} from '../lib/questionAnswer'

const DIAGNOSTIC_COUNT = 15
const DEFAULT_PRACTICE_LIMIT = 20
const MAX_QUESTION_MS = 30 * 60 * 1000

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function markedStorageKey(attemptId) {
  return `mock_marked_${attemptId}`
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

async function loadAttemptedQuestionIds({ userId, subject, chapter, topic }) {
  let query = supabase
    .from('user_attempts')
    .select('question_id')
    .eq('user_id', userId)
  if (subject) query = query.eq('subject', subject)
  if (chapter) query = query.eq('chapter', chapter)
  if (topic) query = query.eq('topic', topic)
  const { data, error } = await query
  if (error) throw error
  return new Set((data || []).map(r => r.question_id))
}

function pickPracticeQuestions(rows, attemptedIds, limit) {
  const fresh = shuffleInPlace(rows.filter(q => !attemptedIds.has(q.id)))
  if (fresh.length >= limit) return fresh.slice(0, limit)
  const seen = shuffleInPlace(rows.filter(q => attemptedIds.has(q.id)))
  return [...fresh, ...seen.slice(0, Math.max(0, limit - fresh.length))]
}

async function loadQuestions({ mode, mock, subject, chapter, topic, userId }) {
  if (mode === 'mock' && mock) {
    return loadMockQuestionSet(mock)
  }

  let query = supabase
    .from('jee_mains')
    .select('id, subject, chapter, topic, difficulty, type, question, options, correct_options, answer, explanation')
    .in('type', ['mcq', 'integer'])
    .eq('is_out_of_syllabus', false)

  if (mode !== 'diagnostic') {
    if (subject) query = query.eq('subject', subject)
    if (chapter) query = query.eq('chapter', chapter)
    if (topic) query = query.eq('topic', topic)
  }
  query = query.order('id', { ascending: true }).limit(2000)

  const { data, error } = await query
  if (error) throw error
  const rows = data || []

  if (mode === 'diagnostic') {
    const bySubject = new Map()
    for (const r of rows) {
      if (!bySubject.has(r.subject)) bySubject.set(r.subject, [])
      bySubject.get(r.subject).push(r)
    }
    const picked = []
    const subjects = [...bySubject.keys()]
    const perSubject = Math.ceil(DIAGNOSTIC_COUNT / Math.max(1, subjects.length))
    for (const s of subjects) {
      picked.push(...shuffleInPlace(bySubject.get(s)).slice(0, perSubject))
    }
    return picked.slice(0, DIAGNOSTIC_COUNT)
  }

  const attemptedIds = await loadAttemptedQuestionIds({ userId, subject, chapter, topic })
  return pickPracticeQuestions(rows, attemptedIds, DEFAULT_PRACTICE_LIMIT)
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
  const [marked, setMarked] = useState(() => new Set())
  const [visited, setVisited] = useState(() => new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const startedAtRef = useRef(Date.now())
  const questionStartedAtRef = useRef(Date.now())
  const timeSpentRef = useRef({})
  const timeUpRef = useRef(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        timeUpRef.current = false
        timeSpentRef.current = {}
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
          qs = await loadQuestions({ mode, mock: mockRow, subject, chapter, topic, userId: user.id })
          if (qs.length === 0) {
            throw new Error('No questions match this mock test. Try a broader custom test or choose another mock.')
          }
          attemptRow = attemptRow
            ? await syncAttemptTotal(attemptRow, qs.length)
            : await loadOrCreateAttempt({ mockId, userId: user.id, totalCount: qs.length })
          startedAtRef.current = new Date(attemptRow.started_at).getTime()
        } else {
          qs = await loadQuestions({ mode, mock: mockRow, subject, chapter, topic, userId: user.id })
        }
        if (cancelled) return

        let resumedAnswers = {}
        let resumeIdx = 0
        let storedMarked = []
        if (mode === 'mock' && attemptRow) {
          const existing = await loadExistingMockAnswers(attemptRow.id)
          for (const a of existing) {
            timeSpentRef.current[a.question_id] = Number(a.time_spent_ms) || 0
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
              resumeIdx = qs.length - 1
            } else {
              resumeIdx = nextIdx
            }
          }
          try {
            storedMarked = JSON.parse(localStorage.getItem(markedStorageKey(attemptRow.id)) || '[]')
          } catch {
            storedMarked = []
          }
        }
        if (cancelled) return

        setMock(mockRow)
        setAttempt(attemptRow)
        setQuestions(qs)
        setAnswers(resumedAnswers)
        setMarked(new Set(Array.isArray(storedMarked) ? storedMarked : []))
        setVisited(new Set(qs.filter(q => q.id in resumedAnswers).map(q => q.id)))
        setIdx(resumeIdx)
        setSelected(resumedAnswers[qs[resumeIdx]?.id]?.selected ?? null)
        questionStartedAtRef.current = Date.now()
        setLoadState({ loading: false, error: null })
      } catch (err) {
        if (!cancelled) setLoadState({ loading: false, error: err })
      }
    }
    if (user) run()
    return () => { cancelled = true }
  }, [user, mode, mockId, attemptIdParam, subject, chapter, topic])

  const timeLimitMin = mode === 'mock' ? (mock?.duration_minutes || 0) : 0

  useEffect(() => {
    if (showSummary || loadState.loading) return
    if (mode === 'mock' && (!mock || !timeLimitMin)) return
    const t = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(t)
  }, [timeLimitMin, mock, mode, showSummary, loadState.loading])

  const remainingMs = useMemo(() => {
    if (!timeLimitMin) return 0
    const totalMs = timeLimitMin * 60 * 1000
    const elapsed = Date.now() - startedAtRef.current
    return Math.max(0, totalMs - elapsed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLimitMin, tick])

  const finishMock = useFinishMock({
    mock, attempt, questions, setAttempt, setShowSummary, setSubmitting, setLoadState,
  })

  const q = questions[idx]
  const isLast = idx === questions.length - 1

  useEffect(() => {
    if (mode !== 'mock' || !q) return
    setVisited(prev => (prev.has(q.id) ? prev : new Set(prev).add(q.id)))
  }, [mode, q])

  useEffect(() => {
    if (mode !== 'mock' || !attempt || attempt.status !== 'started') return
    localStorage.setItem(markedStorageKey(attempt.id), JSON.stringify([...marked]))
  }, [marked, mode, attempt])

  function accumulateTime() {
    if (!q) return
    const stint = Date.now() - questionStartedAtRef.current
    timeSpentRef.current[q.id] = Math.min(MAX_QUESTION_MS, (timeSpentRef.current[q.id] || 0) + stint)
    questionStartedAtRef.current = Date.now()
  }

  function pendingSelection() {
    if (selected == null || String(selected).trim() === '') return null
    return selected
  }

  async function persistCurrentAnswer() {
    if (mode !== 'mock' || !attempt || !q) return
    const value = pendingSelection()
    const savedSel = answers[q.id]?.selected ?? null
    if (value == null || value === savedSel) return
    const isCorrect = checkAnswer(q, value)
    await createOrUpdateMockAnswer({
      user_id: user.id,
      mock_attempt_id: attempt.id,
      question_id: q.id,
      subject: q.subject, chapter: q.chapter, topic: q.topic,
      selected_option: value,
      is_correct: isCorrect,
      time_spent_ms: timeSpentRef.current[q.id] || 0,
      attempted_at: new Date().toISOString(),
    })
    setAnswers(prev => ({
      ...prev,
      [q.id]: {
        selected: value,
        isCorrect,
        timeSpentMs: timeSpentRef.current[q.id] || 0,
        subject: q.subject, chapter: q.chapter, topic: q.topic,
      },
    }))
  }

  async function gotoQuestion(nextIdx) {
    if (mode !== 'mock' || submitting) return
    if (nextIdx === idx || nextIdx < 0 || nextIdx >= questions.length) return
    accumulateTime()
    try {
      await persistCurrentAnswer()
    } catch (error) {
      setLoadState({ loading: false, error })
      return
    }
    setIdx(nextIdx)
    setSelected(answers[questions[nextIdx].id]?.selected ?? null)
    questionStartedAtRef.current = Date.now()
  }

  async function submitTest() {
    if (submitting) return
    setConfirmOpen(false)
    accumulateTime()
    try {
      await persistCurrentAnswer()
    } catch (error) {
      setLoadState({ loading: false, error })
      return
    }
    await finishMock()
  }

  function toggleMarked() {
    if (!q) return
    setMarked(prev => {
      const next = new Set(prev)
      if (next.has(q.id)) next.delete(q.id)
      else next.add(q.id)
      return next
    })
  }

  useEffect(() => {
    if (mode !== 'mock' || !timeLimitMin || !mock || showSummary || submitting || loadState.loading) return
    if (remainingMs > 0 || timeUpRef.current) return
    timeUpRef.current = true
    submitTest()
  })

  async function handleSubmit() {
    if (!selected || submitting) return
    setSubmitting(true)
    const elapsed = Math.min(10 * 60 * 1000, Date.now() - questionStartedAtRef.current)
    const isCorrect = checkAnswer(q, selected)

    const { error } = await supabase.from('user_attempts').insert({
      user_id: user.id,
      question_id: q.id,
      subject: q.subject, chapter: q.chapter, topic: q.topic,
      selected_option: selected,
      is_correct: isCorrect,
      time_spent_ms: elapsed,
    })
    if (error) { setLoadState({ loading: false, error }); setSubmitting(false); return }

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
      setShowSummary(true)
    }
  }

  function handleSkip() {
    if (submitting) return
    handleNext()
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  if (loadState.loading) {
    return <SkeletonPractice />
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
      timeLimitMs={timeLimitMin > 0 ? timeLimitMin * 60 * 1000 : null}
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

  const questionElapsedMs = Date.now() - questionStartedAtRef.current
  const correct = correctOption(q)
  const correctVal = correctDisplay(q)
  const numerical = isNumerical(q)
  const showCorrectness = mode !== 'mock' && submitted
  const isCorrectAnswer = checkAnswer(q, selected)
  const answeredCount = Object.keys(answers).length + (q && !answers[q.id] && pendingSelection() ? 1 : 0)
  const unansweredCount = Math.max(0, questions.length - answeredCount)
  const progressRatio = mode === 'mock'
    ? answeredCount / questions.length
    : (idx + (submitted ? 1 : 0)) / questions.length

  const headerLabel = mode === 'mock'
    ? mock?.title
    : mode === 'diagnostic'
      ? 'Diagnostic Test'
      : [subject, chapter && slugToTitle(chapter), topic && slugToTitle(topic)].filter(Boolean).join(' · ')

  return (
    <div className="practice-wrap">
      <div className="practice-bar">
        <button className="practice-close" onClick={() => navigate(-1)} aria-label="Close">
          <X size={20} />
        </button>
        <div className="practice-progress" aria-label={`Question ${idx + 1} of ${questions.length}`}>
          <div className="practice-progress-fill" style={{ width: `${progressRatio * 100}%` }} />
        </div>
        <div className="practice-progress-text">
          {idx + 1} / {questions.length}
        </div>
        {mode === 'mock' ? (
          <>
            {timeLimitMin > 0 && (
              <div className={`practice-timer ${remainingMs < 60_000 ? 'warn' : ''}`} aria-label="Time remaining">
                {formatClock(remainingMs)}
              </div>
            )}
            <button
              className="btn-outline"
              style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, flexShrink: 0 }}
              disabled={submitting}
              onClick={() => setConfirmOpen(true)}
            >
              Submit
            </button>
          </>
        ) : (
          <div className="practice-timer" aria-label="Time on this question">
            {formatClock(questionElapsedMs)}
          </div>
        )}
      </div>

      {mode === 'mock' && (
        <>
          <div className="qpalette" aria-label="Question palette">
            {questions.map((item, i) => {
              const cls = [
                'qpalette-chip',
                i === idx ? 'current' : '',
                answers[item.id] ? 'answered' : visited.has(item.id) ? 'seen' : '',
                marked.has(item.id) ? 'marked' : '',
              ].filter(Boolean).join(' ')
              return (
                <button key={item.id} className={cls} onClick={() => gotoQuestion(i)} aria-label={`Go to question ${i + 1}`}>
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="qpalette-legend">
            <span><i className="qpalette-dot answered" /> Answered</span>
            <span><i className="qpalette-dot seen" /> Seen</span>
            <span><i className="qpalette-dot marked" /> Marked for review</span>
          </div>
        </>
      )}

      {(headerLabel || (mode !== 'mock' && q.difficulty)) && (
        <div className="practice-meta">
          {headerLabel}
          {mode !== 'mock' && q.difficulty && <span style={{ marginLeft: 12, color: 'var(--primary)' }}>· {displayDifficulty(q.difficulty)}</span>}
        </div>
      )}

      <div className="practice-actions">
        {mode === 'mock' ? (
          <>
            <button
              className="btn-outline practice-nav-btn"
              disabled={idx === 0 || submitting}
              onClick={() => gotoQuestion(idx - 1)}
            >
              <ArrowLeft size={18} />
              Prev
            </button>
            <button
              className={`btn-outline practice-nav-btn ${marked.has(q.id) ? 'is-marked' : ''}`}
              disabled={submitting}
              onClick={toggleMarked}
            >
              <Flag size={18} />
              {marked.has(q.id) ? 'Marked' : 'Mark'}
            </button>
            <div className="flex-1" />
            {isLast ? (
              <button className="submit-btn" disabled={submitting} onClick={() => setConfirmOpen(true)}>
                {submitting ? 'Submitting…' : 'Submit Test'}
              </button>
            ) : (
              <button className="submit-btn" disabled={submitting} onClick={() => gotoQuestion(idx + 1)}>
                Save & Next
                <ArrowRight size={18} />
              </button>
            )}
          </>
        ) : !submitted ? (
          <>
            <div className="flex-1" />
            <button className="btn-outline practice-nav-btn" disabled={submitting} onClick={handleSkip}>
              Skip
              <SkipForward size={18} />
            </button>
            <button className="submit-btn" disabled={!selected || submitting} onClick={handleSubmit}>
              {submitting ? 'Saving…' : 'Submit'}
            </button>
          </>
        ) : (
          <button className="submit-btn" onClick={handleNext}>
            {isLast ? 'Finish' : 'Next Question'}
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      <div className="question-card">
        <MathText>{q.question}</MathText>

        <div className="option-list">
          {numerical ? (
            <div
              className={`option-chip numerical-chip ${showCorrectness ? (isCorrectAnswer ? 'correct' : (selected ? 'wrong' : '')) : ''}`}
            >
              <input
                type="text"
                inputMode="decimal"
                placeholder="Enter your answer"
                value={selected ?? ''}
                onChange={e => !submitted && setSelected(e.target.value)}
                disabled={submitted}
                className="numerical-input"
              />
              {showCorrectness && !isCorrectAnswer && correctVal != null && (
                <span className="numerical-correct">Correct: {correctVal}</span>
              )}
            </div>
          ) : (q.options || []).map(opt => {
            const isSelected = selected === opt.identifier
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

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit test?"
        footer={(
          <>
            <button
              className="btn-outline"
              style={{ padding: '10px 16px', borderRadius: 10 }}
              onClick={() => setConfirmOpen(false)}
            >
              Keep going
            </button>
            <button
              className="submit-btn"
              style={{ width: 'auto', padding: '10px 20px' }}
              disabled={submitting}
              onClick={submitTest}
            >
              {submitting ? 'Submitting…' : 'Submit Test'}
            </button>
          </>
        )}
      >
        <p className="text-sm" style={{ lineHeight: 1.7 }}>
          You've answered {answeredCount} of {questions.length} questions.
          {unansweredCount > 0 && <> <strong>{unansweredCount} unanswered</strong> will be scored as incorrect.</>}
          {marked.size > 0 && <> {marked.size} still marked for review.</>}
        </p>
      </Modal>
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
      localStorage.removeItem(markedStorageKey(attempt.id))
      setShowSummary(true)
    } catch (err) {
      setLoadState({ loading: false, error: err })
    } finally {
      setSubmitting(false)
    }
  }
}

function Summary({ mode, mock, attempt, questions, answers, onClose, timeLimitMs }) {
  const navigate = useNavigate()

  const items = useMemo(() => Object.values(answers).map(a => ({
    subject: a.subject,
    chapter: a.chapter,
    topic: a.topic,
    isCorrect: a.isCorrect,
    timeSpentMs: a.timeSpentMs,
  })), [answers])

  const analytics = useMemo(() => computeTestAnalytics(items), [items])

  const title = mode === 'mock' ? mock?.title : mode === 'diagnostic' ? 'Diagnostic Complete' : 'Set Complete'

  const actions = mode === 'mock' && mock ? (
    <>
      <button className="btn-outline" style={{ padding: '12px 20px', borderRadius: 10 }} onClick={() => navigate(`/tests/${mock.id}/review?attempt=${attempt?.id || ''}`)}>
        Review Answers
      </button>
      <button className="submit-btn" style={{ width: 'auto', padding: '12px 24px' }} onClick={onClose}>
        Done
      </button>
    </>
  ) : (
    <>
      <button className="btn-outline" style={{ padding: '12px 20px', borderRadius: 10 }} onClick={() => navigate('/analytics')}>
        View Analytics
      </button>
      <button className="submit-btn" style={{ width: 'auto', padding: '12px 24px' }} onClick={onClose}>
        Done
      </button>
    </>
  )

  return (
    <div className="practice-wrap">
      <TestAnalyticsView analytics={analytics} title={title} actions={actions} timeLimitMs={timeLimitMs} />
    </div>
  )
}
