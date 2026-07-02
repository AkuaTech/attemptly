const NUMERIC_TOLERANCE = 0.01

export function isNumerical(q) {
  return q?.type === 'integer'
}

export function correctOption(q) {
  const arr = Array.isArray(q?.correct_options) ? q.correct_options : []
  return arr[0] || null
}

// Compare the student's selected value to the question's correct answer.
// Numerical questions parse both sides as floats and compare with a tolerance
// that forgives 2-decimal rounding (JEE numerical answers are integers or up
// to 2 decimals). MCQs use an exact option-identifier match.
export function checkAnswer(q, selected) {
  if (selected == null || selected === '') return false
  if (isNumerical(q)) {
    const a = parseFloat(String(selected))
    const b = parseFloat(String(q?.answer))
    if (Number.isNaN(a) || Number.isNaN(b)) return false
    return Math.abs(a - b) <= NUMERIC_TOLERANCE
  }
  return selected === correctOption(q)
}

// What to show as "the correct answer" in review / post-submit feedback.
export function correctDisplay(q) {
  if (isNumerical(q)) return q?.answer != null ? String(q.answer) : null
  return correctOption(q)
}
