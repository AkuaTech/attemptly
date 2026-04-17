import katex from 'katex'
import 'katex/dist/katex.min.css'

function renderLatex(src, displayMode = false) {
  try {
    return katex.renderToString(src, {
      displayMode,
      throwOnError: false,
      trust: true,
    })
  } catch {
    return src
  }
}

export default function MathText({ children, className, style }) {
  if (!children) return null

  const raw = String(children)

  const parts = []
  let cursor = 0
  const re = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g
  let match

  while ((match = re.exec(raw)) !== null) {
    if (match.index > cursor) {
      parts.push({ type: 'text', val: raw.slice(cursor, match.index) })
    }
    if (match[1] !== undefined) {
      parts.push({ type: 'display', val: match[1] })
    } else {
      parts.push({ type: 'inline', val: match[2] })
    }
    cursor = match.index + match[0].length
  }

  if (cursor < raw.length) {
    parts.push({ type: 'text', val: raw.slice(cursor) })
  }

  return (
    <span className={className} style={style}>
      {parts.map((p, i) => {
        if (p.type === 'text') return <span key={i}>{p.val}</span>
        const html = renderLatex(p.val, p.type === 'display')
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: html }}
            style={p.type === 'display' ? { display: 'block', textAlign: 'center', margin: '8px 0' } : {}}
          />
        )
      })}
    </span>
  )
}
