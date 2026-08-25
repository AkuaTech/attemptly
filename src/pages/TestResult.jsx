import { ArrowLeft } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import TestAnalyticsView from '../components/TestAnalyticsView'
import { computeTestAnalytics } from '../lib/testAnalytics'
import { dedupeAttemptsByQuestion } from '../lib/mockContract'
import { SkeletonPractice } from '../components/Skeleton'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function TestResult() {
  const { attemptId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ loading: true, error: null, attempt: null, mock: null, items: [] })

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      try {
        const { data: attempt, error: aErr } = await supabase
          .from('mock_test_attempts')
          .select('*, mock_tests(*)')
          .eq('id', attemptId)
          .eq('user_id', user.id)
          .maybeSingle()
        if (aErr) throw aErr
        if (!attempt) {
          if (!cancelled) setData({ loading: false, error: null, attempt: null, mock: null, items: [] })
          return
        }

        const { data: rows, error: uErr } = await supabase
          .from('user_attempts')
          .select('question_id, subject, chapter, topic, is_correct, time_spent_ms, attempted_at')
          .eq('user_id', user.id)
          .eq('mock_attempt_id', attempt.id)
          .order('attempted_at', { ascending: true })
        if (uErr) throw uErr

        const deduped = dedupeAttemptsByQuestion(rows || [])
        const items = deduped.map(r => ({
          subject: r.subject,
          chapter: r.chapter,
          topic: r.topic,
          isCorrect: r.is_correct,
          timeSpentMs: r.time_spent_ms,
        }))

        if (!cancelled) setData({ loading: false, error: null, attempt, mock: attempt.mock_tests, items })
      } catch (err) {
        if (!cancelled) setData({ loading: false, error: err, attempt: null, mock: null, items: [] })
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, attemptId])

  const analytics = useMemo(() => computeTestAnalytics(data.items), [data.items])

  if (data.loading) {
    return <SkeletonPractice />
  }
  if (data.error) {
    return <div className="practice-wrap"><p className="form-error">{data.error.message}</p></div>
  }
  if (!data.attempt) {
    return (
      <div className="practice-wrap">
        <p className="text-muted text-sm">This result is no longer available.</p>
        <button className="btn-outline" style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, alignSelf: 'flex-start' }} onClick={() => navigate('/tests/history')}>
          Back to history
        </button>
      </div>
    )
  }

  const actions = (
    <>
      <button
        className="btn-outline"
        style={{ padding: '12px 20px', borderRadius: 10 }}
        onClick={() => navigate(`/tests/${data.attempt.mock_test_id}/review?attempt=${data.attempt.id}`)}
      >
        Review Answers
      </button>
      <button
        className="submit-btn"
        style={{ width: 'auto', padding: '12px 24px' }}
        onClick={() => navigate('/tests/history')}
      >
        Back to History
      </button>
    </>
  )

  return (
    <div className="practice-wrap">
      <div className="practice-bar">
        <button className="practice-close" onClick={() => navigate('/tests/history')} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-bold" style={{ fontFamily: 'var(--fh)', fontSize: 16 }}>{data.mock?.title || 'Test Result'}</div>
          <div className="text-micro">Performance analysis</div>
        </div>
      </div>

      <TestAnalyticsView
        analytics={analytics}
        title={data.mock?.title}
        subtitle={data.attempt.completed_at ? `Completed ${formatDate(data.attempt.completed_at)}` : null}
        actions={actions}
      />
    </div>
  )
}
