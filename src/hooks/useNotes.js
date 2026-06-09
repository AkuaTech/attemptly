import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useNotes({ userId = null, subject = null, chapter = null, topic = null } = {}) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!userId) {
        setNotes([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)

      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (subject) query = query.eq('subject', subject)
      if (chapter) query = query.eq('chapter', chapter)
      if (topic) query = query.eq('topic', topic)

      const { data, error: err } = await query
      if (cancelled) return
      if (err) setError(err)
      else setNotes(data || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [userId, subject, chapter, topic])

  async function saveNote({ id, title, content, subject: s, chapter: c, topic: t, attachments = [] }) {
    if (id) {
      const { data, error: err } = await supabase
        .from('notes')
        .update({ title, content, subject: s, chapter: c, topic: t, attachments })
        .eq('id', id)
        .select()
        .single()
      if (err) return { error: err }
      setNotes(prev => prev.map(n => (n.id === id ? data : n)))
      return { data }
    }
    const { data, error: err } = await supabase
      .from('notes')
      .insert({ user_id: userId, title, content, subject: s, chapter: c, topic: t, attachments })
      .select()
      .single()
    if (err) return { error: err }
    setNotes(prev => [data, ...prev])
    return { data }
  }

  async function removeNote(id) {
    const { error: err } = await supabase.from('notes').delete().eq('id', id)
    if (err) return { error: err }
    setNotes(prev => prev.filter(n => n.id !== id))
    return {}
  }

  return { notes, loading, error, saveNote, removeNote }
}
