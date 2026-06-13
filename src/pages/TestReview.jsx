import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import MathText from '../components/MathText'
import { dedupeAttemptsByQuestion } from '../lib/mockContract'

function correctIdentifier(q) {
  const arr = Array.isArray(q.correct_options) ? q.correct_options : []
  return arr[0] || null
}

export default function TestReview() {
  const { id: mockId } = useParams()
  const [params] = useSearchParams()
  const attemptIdParam = params.get('attempt')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ loading: true, error: null, attempt: null, mock: null, items: [] })

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      try {
        let attemptQuery = supabase
          .from('mock_test_attempts')
          .select('*, mock_tests(*)')
          .eq('user_id', user.id)
        attemptQuery = attemptIdParam
          ? attemptQuery.eq('id', attemptIdParam)
          : attemptQuery
              .eq('mock_test_id', mockId)
              .eq('status', 'completed')
              .order('completed_at', { ascending: false })
              .limit(1)
        const { data: attempt, error: aErr } = await attemptQuery.maybeSingle()
        if (aErr) throw aErr
        if (!attempt) {
          if (!cancelled) setData({ loading: false, error: null, attempt: null, mock: null, items: [] })
          return
        }

        const { data: attempts, error: uErr } = await supabase
          .from('user_attempts')
          .select('question_id, selected_option, is_correct, time_spent_ms, attempted_at')
          .eq('user_id', user.id)
          .eq('mock_attempt_id', attempt.id)
          .order('attempted_at', { ascending: true })
        if (uErr) throw uErr

        const dedupedAttempts = dedupeAttemptsByQuestion(attempts || [])
        const ids = [...new Set(dedupedAttempts.map(a => a.question_id))]
        let questions = []
        if (ids.length > 0) {
          const { data: qData, error: qErr } = await supabase
            .from('jee_mains')
            .select('id, subject, chapter, topic, question, options, correct_options, explanation')
            .in('id', ids)
          if (qErr) throw qErr
          questions = qData || []
        }
        const qById = new Map(questions.map(q => [q.id, q]))
        const items = dedupedAttempts
          .map(a => ({ attempt: a, question: qById.get(a.question_id) }))
          .filter(x => x.question)

        if (!cancelled) setData({ loading: false, error: null, attempt, mock: attempt.mock_tests, items })
      } catch (err) {
        if (!cancelled) setData({ loading: false, error: err, attempt: null, mock: null, items: [] })
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, mockId, attemptIdParam])

  if (data.loading) {
    return <div className="practice-wrap"><p className="text-muted text-sm">Loading review…</p></div>
  }
  if (data.error) {
    return <div className="practice-wrap"><p className="form-error">{data.error.message}</p></div>
  }
  if (!data.attempt) {
    return (
      <div className="practice-wrap">
        <p className="text-muted text-sm">No completed attempt found for this test.</p>
        <button className="btn-outline" style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, alignSelf: 'flex-start' }} onClick={() => navigate('/tests')}>
          Back to tests
        </button>
      </div>
    )
  }

  return (
    <div className="practice-wrap">
      <div className="practice-bar">
        <button className="practice-close" onClick={() => navigate('/tests')} aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-bold" style={{ fontFamily: 'var(--fh)', fontSize: 16 }}>{data.mock?.title}</div>
          <div className="text-micro">{data.attempt.correct_count}/{data.attempt.total_count} · {Math.round(Number(data.attempt.score) || 0)}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.items.map(({ attempt, question }, i) => {
          const correct = correctIdentifier(question)
          return (
            <div key={attempt.question_id} className="question-card" style={{ padding: 24 }}>
              <div className="practice-meta" style={{ marginBottom: 12 }}>
                Q{i + 1} · {question.subject} {attempt.is_correct ? '· Correct' : '· Wrong'}
              </div>
              <MathText>{question.question}</MathText>
              <div className="option-list">
                {(question.options || []).map(opt => {
                  const isUser = attempt.selected_option === opt.identifier
                  const isCorrect = opt.identifier === correct
                  const isWrong = isUser && !isCorrect
                  return (
                    <div
                      key={opt.identifier}
                      className={`option-chip ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                      style={{ cursor: 'default' }}
                    >
                      <span className="option-letter">{opt.identifier}</span>
                      <MathText style={{ flex: 1 }}>{opt.content}</MathText>
                    </div>
                  )
                })}
              </div>
              {question.explanation && (
                <div className="explanation-card">
                  <h4>Explanation</h4>
                  <MathText>{question.explanation}</MathText>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
