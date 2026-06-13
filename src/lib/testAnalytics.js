import { slugToTitle } from './slug'

const SUBJECT_ORDER = ['Physics', 'Chemistry', 'Mathematics']
const WEAK_THRESHOLD = 0.6
const STRONG_THRESHOLD = 0.8

export function topicLabel(topic) {
  return slugToTitle(topic) || 'Untitled topic'
}

export function chapterLabel(chapter) {
  return slugToTitle(chapter)
}

export function computeTestAnalytics(items = []) {
  const clean = items.filter(Boolean)
  const total = clean.length
  const correct = clean.filter(i => i.isCorrect).length
  const wrong = total - correct
  const accuracy = total > 0 ? correct / total : 0
  const totalTimeMs = clean.reduce((s, i) => s + (Number(i.timeSpentMs) || 0), 0)
  const avgSec = total > 0 ? totalTimeMs / total / 1000 : 0

  const subjectMap = new Map()
  const topicMap = new Map()
  for (const i of clean) {
    const subject = i.subject || 'Other'
    if (!subjectMap.has(subject)) subjectMap.set(subject, { subject, total: 0, correct: 0 })
    const sg = subjectMap.get(subject)
    sg.total++
    if (i.isCorrect) sg.correct++

    const key = `${subject}|${i.chapter || ''}|${i.topic || ''}`
    if (!topicMap.has(key)) {
      topicMap.set(key, { subject, chapter: i.chapter || '', topic: i.topic || '', total: 0, correct: 0, timeMs: 0 })
    }
    const tg = topicMap.get(key)
    tg.total++
    if (i.isCorrect) tg.correct++
    tg.timeMs += Number(i.timeSpentMs) || 0
  }

  const subjects = [...subjectMap.values()]
    .map(s => ({ ...s, accuracy: s.total > 0 ? s.correct / s.total : 0 }))
    .sort((a, b) => {
      const ai = SUBJECT_ORDER.indexOf(a.subject)
      const bi = SUBJECT_ORDER.indexOf(b.subject)
      if (ai === -1 && bi === -1) return a.subject.localeCompare(b.subject)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })

  const topics = [...topicMap.values()].map(t => ({
    ...t,
    accuracy: t.total > 0 ? t.correct / t.total : 0,
    avgSec: t.total > 0 ? t.timeMs / t.total / 1000 : 0,
  }))

  const weakTopics = topics
    .filter(t => t.accuracy < WEAK_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, 5)

  const strongTopics = topics
    .filter(t => t.accuracy >= STRONG_THRESHOLD && t.total > 0)
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
    .slice(0, 5)

  return {
    total,
    correct,
    wrong,
    accuracy,
    totalTimeMs,
    avgSec,
    subjects,
    topics,
    weakTopics,
    strongTopics,
  }
}

export function formatDurationMs(ms) {
  const totalSec = Math.max(0, Math.round((Number(ms) || 0) / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
