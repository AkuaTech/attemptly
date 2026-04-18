export function slugToTitle(slug) {
  if (!slug) return ''
  return String(slug)
    .split('-')
    .map(w => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
}
