import assert from 'node:assert/strict'
import {
  dedupeAttemptsByQuestion,
  displayDifficulty,
  getMockQuestionLimit,
  normalizeDifficulty,
  shouldFilterMockDifficulty,
} from '../src/lib/mockContract.js'

assert.equal(normalizeDifficulty('Medium'), 'medium')
assert.equal(normalizeDifficulty(' hard '), 'hard')
assert.equal(normalizeDifficulty('unknown'), null)
assert.equal(displayDifficulty('easy'), 'Easy')
assert.equal(displayDifficulty('Hard'), 'Hard')

assert.equal(shouldFilterMockDifficulty({ is_official: false, difficulty: 'Medium' }), true)
assert.equal(shouldFilterMockDifficulty({ is_official: true, difficulty: 'Medium' }), false)
assert.equal(shouldFilterMockDifficulty({ is_official: false, difficulty: 'custom' }), false)

assert.equal(getMockQuestionLimit({ num_questions: 20 }), 20)
assert.equal(getMockQuestionLimit({ num_questions: '30' }), 30)
assert.equal(getMockQuestionLimit({ num_questions: 0 }), 30)

const deduped = dedupeAttemptsByQuestion([
  { question_id: 1, selected_option: 'A' },
  { question_id: 2, selected_option: 'B' },
  { question_id: 1, selected_option: 'C' },
])

assert.deepEqual(deduped, [
  { question_id: 1, selected_option: 'C' },
  { question_id: 2, selected_option: 'B' },
])

console.log('mock contract checks passed')
