import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useQuestions({ limit = 50, subject = null, chapter = null, topic = null } = {}) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('jee_mains')
        .select('*')
        .eq('type', 'mcq')
        .eq('is_out_of_syllabus', false)
        .order('id', { ascending: true })
        .limit(limit)

      if (subject) query = query.eq('subject', subject)
      if (chapter) query = query.eq('chapter', chapter)
      if (topic) query = query.eq('topic', topic)

      const { data, error: err } = await query
      if (cancelled) return

      if (err) setError(err)
      else setQuestions(data || [])
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [limit, subject, chapter, topic])

  return { questions, loading, error }
}
