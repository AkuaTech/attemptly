import { useMemo } from 'react'
import { renderMath } from '../lib/mathRender'

// Question/option/explanation HTML mixes LaTeX ($…$, $$…$$, bare \begin{}…) with
// real HTML (tables, lists, images). We sanitise the HTML, then render each math
// span with KaTeX in place — so structure survives and math renders.

const ALLOWED_TAGS = new Set([
  'br', 'hr', 'p', 'div', 'span', 'b', 'i', 'em', 'strong', 'u', 'sup', 'sub', 'small',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
  'figure', 'figcaption', 'picture', 'source', 'img', 'a',
])

function sanitizeHtml(raw) {
  return raw
    // Drop <script>/<style> blocks entirely (tag + contents) — the old sanitizer
    // stripped the tags but leaked their CSS/JS as visible text.
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, '$1="#"')
    // Keep allowed tags only (drop others but keep their inner text). Strip inline
    // event handlers *within tags only* — a global on\w+= strip would eat prose
    // like "one = ..." or "Class = 12".
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, slash, tag, attrs) =>
      ALLOWED_TAGS.has(tag.toLowerCase())
        ? '<' + slash + tag + attrs.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '') + '>'
        : '')
}

export default function MathText({ children, className, style }) {
  const html = useMemo(() => {
    if (children === null || children === undefined) return ''
    return renderMath(sanitizeHtml(String(children)))
  }, [children])

  if (!html) return null
  return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />
}
