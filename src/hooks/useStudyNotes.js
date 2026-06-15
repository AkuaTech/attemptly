import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

// PostgREST caps every response at the project's "Max rows" setting (1000 by
// default). The full notes tree is ~2,200 rows, so a single select silently
// drops everything past row 1000 — which (sorted alphabetically) wiped out
// Physics entirely and most of Mathematics. Page through to fetch them all.
const PAGE_SIZE = 1000

export function useStudyNotes({ subject = null, chapter = null, topic = null } = {}) {
  const [tree, setTree] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)

      const rows = []
      for (let from = 0; ; from += PAGE_SIZE) {
        let query = supabase
          .from('study_notes')
          .select('id, subject, chapter, topic, title, created_at')
          .order('subject', { ascending: true })
          .order('chapter', { ascending: true })
          .order('topic', { ascending: true })
          .order('title', { ascending: true })
          .order('id', { ascending: true })
          .range(from, from + PAGE_SIZE - 1)

        if (subject) query = query.eq('subject', subject)
        if (chapter) query = query.eq('chapter', chapter)
        if (topic) query = query.eq('topic', topic)

        const { data, error: err } = await query
        if (cancelled) return
        if (err) {
          setError(err)
          setLoading(false)
          return
        }
        rows.push(...(data || []))
        if (!data || data.length < PAGE_SIZE) break
      }

      const grouped = {}
      for (const note of rows) {
        if (!grouped[note.subject]) grouped[note.subject] = {}
        if (!grouped[note.subject][note.chapter]) grouped[note.subject][note.chapter] = {}
        if (!grouped[note.subject][note.chapter][note.topic]) {
          grouped[note.subject][note.chapter][note.topic] = []
        }
        grouped[note.subject][note.chapter][note.topic].push(note)
      }

      setTree(grouped)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [subject, chapter, topic])

  async function fetchNoteContent(noteId) {
    const { data, error } = await supabase
      .from('study_notes')
      .select('*')
      .eq('id', noteId)
      .single()
    if (error) throw error
    return data
  }

  return { tree, loading, error, fetchNoteContent }
}
