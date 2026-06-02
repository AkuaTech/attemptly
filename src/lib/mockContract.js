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

export function dedupeAttemptsByQuestion(rows = []) {
  const byQuestion = new Map()
  for (const row of rows) {
    byQuestion.set(row.question_id, row)
  }
  return [...byQuestion.values()]
}
