import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const PAGE_SIZE = 1000
const chaptersCache = new Map()
const topicsCache = new Map()

async function fetchAllPages(queryBuilder) {
  const all = []
  let from = 0
  while (true) {
    const { data, error } = await queryBuilder().range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return all
}

function aggregate(rows, key) {
  const counts = new Map()
  for (const row of rows) {
    const v = row[key]
    if (!v) continue
    counts.set(v, (counts.get(v) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

export function useChapters(subject) {
  const [state, setState] = useState({ chapters: [], loading: true, error: null })

  useEffect(() => {
    if (!subject) {
      setState({ chapters: [], loading: false, error: null })
      return
    }

    if (chaptersCache.has(subject)) {
      setState({ chapters: chaptersCache.get(subject), loading: false, error: null })
      return
    }

    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    fetchAllPages(() =>
      supabase
        .from('jee_mains')
        .select('chapter')
        .eq('subject', subject)
        .in('type', ['mcq', 'integer'])
        .eq('is_out_of_syllabus', false)
        .order('chapter', { ascending: true })
    )
      .then(rows => {
        if (cancelled) return
        const chapters = aggregate(rows, 'chapter')
        chaptersCache.set(subject, chapters)
        setState({ chapters, loading: false, error: null })
      })
      .catch(err => {
        if (cancelled) return
        setState({ chapters: [], loading: false, error: err })
      })

    return () => { cancelled = true }
  }, [subject])

  return state
}

export function useTopics(subject, chapter) {
  const [state, setState] = useState({ topics: [], loading: true, error: null })

  useEffect(() => {
    if (!subject || !chapter) {
      setState({ topics: [], loading: false, error: null })
      return
    }

    const cacheKey = `${subject}::${chapter}`
    if (topicsCache.has(cacheKey)) {
      setState({ topics: topicsCache.get(cacheKey), loading: false, error: null })
      return
    }

    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    fetchAllPages(() =>
      supabase
        .from('jee_mains')
        .select('topic')
        .eq('subject', subject)
        .eq('chapter', chapter)
        .in('type', ['mcq', 'integer'])
        .eq('is_out_of_syllabus', false)
        .order('topic', { ascending: true })
    )
      .then(rows => {
        if (cancelled) return
        const topics = aggregate(rows, 'topic')
        topicsCache.set(cacheKey, topics)
        setState({ topics, loading: false, error: null })
      })
      .catch(err => {
        if (cancelled) return
        setState({ topics: [], loading: false, error: err })
      })

    return () => { cancelled = true }
  }, [subject, chapter])

  return state
}
