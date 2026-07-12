import { isNumerical } from './questionAnswer'

export const MOCK_DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const difficultyLabels = new Map(MOCK_DIFFICULTIES.map(d => [d.value, d.label]))

export function normalizeDifficulty(value) {
  if (!value) return null
  const normalized = String(value).trim().toLowerCase()
  return difficultyLabels.has(normalized) ? normalized : null
}

export function displayDifficulty(value) {
  const normalized = normalizeDifficulty(value)
  return normalized ? difficultyLabels.get(normalized) : value
}

export function shouldFilterMockDifficulty(mock) {
  return Boolean(mock && mock.is_official === false && normalizeDifficulty(mock.difficulty))
}

export function getMockQuestionLimit(mock, fallback = 30) {
  const limit = Number(mock?.num_questions)
  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : fallback
}

export function pickMockQuestions(rows = [], limit) {
  if (!Number.isFinite(limit) || limit <= 0 || rows.length <= limit) return rows
  const numerical = rows.filter(isNumerical)
  if (numerical.length === 0) return rows.slice(0, limit)
  const mcq = rows.filter(q => !isNumerical(q))
  let numericalTarget = Math.max(1, Math.round((numerical.length / rows.length) * limit))
  numericalTarget = Math.min(numericalTarget, numerical.length, limit)
  const mcqTarget = Math.min(limit - numericalTarget, mcq.length)
  const chosen = new Set(
    [...mcq.slice(0, mcqTarget), ...numerical.slice(0, limit - mcqTarget)].map(q => q.id)
  )
  return rows.filter(q => chosen.has(q.id))
}

export function dedupeAttemptsByQuestion(rows = []) {
  const byQuestion = new Map()
  for (const row of rows) {
    byQuestion.set(row.question_id, row)
  }
  return [...byQuestion.values()]
}
