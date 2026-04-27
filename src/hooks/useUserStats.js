import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

export function useUserProgress() {
  const { user } = useAuth()
  const [state, setState] = useState({ rows: [], loading: true, error: null })

  useEffect(() => {
    if (!user) { setState({ rows: [], loading: false, error: null }); return }
    let cancelled = false
    supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_attempted_at', { ascending: false, nullsFirst: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setState({ rows: data || [], loading: false, error })
      })
    return () => { cancelled = true }
  }, [user])

  return state
}

export function useDashboardStats() {
  const { user } = useAuth()
  const [state, setState] = useState({
    totals: { solved: 0, correct: 0, totalTimeMs: 0 },
    weekly: [],
    weekDelta: 0,
    weakTopics: [],
    resume: null,
    inProgressMock: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!user) { setState(s => ({ ...s, loading: false })); return }
    let cancelled = false

    async function load() {
      const sinceTwoWeeks = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

      const [progressRes, recentAttemptsRes, mockRes] = await Promise.all([
        supabase
          .from('user_progress')
          .select('subject, chapter, topic, questions_solved, questions_correct, total_time_ms, last_attempted_at')
          .eq('user_id', user.id),
        supabase
          .from('user_attempts')
          .select('attempted_at, is_correct')
          .eq('user_id', user.id)
          .gte('attempted_at', sinceTwoWeeks)
          .order('attempted_at', { ascending: true }),
        supabase
          .from('mock_test_attempts')
          .select('id, mock_test_id, started_at, status, mock_tests(title, num_questions, duration_minutes, pattern)')
          .eq('user_id', user.id)
          .eq('status', 'started')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (cancelled) return

      const progress = progressRes.data || []
      const totals = progress.reduce((acc, r) => ({
        solved: acc.solved + (r.questions_solved || 0),
        correct: acc.correct + (r.questions_correct || 0),
        totalTimeMs: acc.totalTimeMs + Number(r.total_time_ms || 0),
      }), { solved: 0, correct: 0, totalTimeMs: 0 })

      const today = new Date()
      const dayKey = d => d.toISOString().slice(0, 10)
      const dayBuckets = new Map()
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i)
        dayBuckets.set(dayKey(d), 0)
      }
      for (const a of recentAttemptsRes.data || []) {
        const k = a.attempted_at.slice(0, 10)
        if (dayBuckets.has(k)) dayBuckets.set(k, dayBuckets.get(k) + 1)
      }
      const weekly = [...dayBuckets.entries()].map(([date, count]) => ({ date, count }))
      const thisWeek = weekly.slice(7).reduce((s, d) => s + d.count, 0)
      const lastWeek = weekly.slice(0, 7).reduce((s, d) => s + d.count, 0)
      const weekDelta = lastWeek === 0
        ? (thisWeek > 0 ? 100 : 0)
        : Math.round(((thisWeek - lastWeek) / lastWeek) * 100)

      const weakTopics = progress
        .filter(r => (r.questions_solved || 0) >= 5)
        .map(r => ({
          subject: r.subject, chapter: r.chapter, topic: r.topic,
          accuracy: r.questions_correct / r.questions_solved,
          avgTimeSec: r.total_time_ms / r.questions_solved / 1000,
          solved: r.questions_solved,
        }))
        .filter(t => t.accuracy < 0.65)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3)

      const sortedByRecent = [...progress]
        .filter(r => r.last_attempted_at)
        .sort((a, b) => new Date(b.last_attempted_at) - new Date(a.last_attempted_at))
      const resume = sortedByRecent[0] || null

      setState({
        totals,
        weekly: weekly.slice(7),
        weekDelta,
        weakTopics,
        resume,
        inProgressMock: mockRes.data || null,
        loading: false,
        error: progressRes.error || recentAttemptsRes.error || mockRes.error || null,
      })
    }

    load()
    return () => { cancelled = true }
  }, [user])

  return state
}
