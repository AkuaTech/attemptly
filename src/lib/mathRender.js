import katex from 'katex'
import 'katex/contrib/mhchem' // registers \ce{} for chemistry equations
import 'katex/dist/katex.min.css'

// Math in the database is pre-normalised to clean KaTeX LaTeX (see the one-time
// DB cleanup), so rendering is just: split on $…$ / $$…$$ and hand each segment
// to KaTeX. Inline-first (this data uses $$ for inline content too); renderSeg
// retries display mode for environments like \begin{aligned} that require it.

function renderSeg(tex, display) {
  for (const mode of [display, !display]) {
    try {
      return katex.renderToString(tex, { displayMode: mode, throwOnError: true, trust: true, strict: false, output: 'html' })
    } catch {
      // try the other mode
    }
  }
  return null // leave the raw text rather than a red error
}

export function renderMath(html) {
  if (!html) return ''
  return html
    .replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => renderSeg(t, false) ?? m)
    .replace(/\$([^$]+?)\$/g, (m, t) => renderSeg(t, false) ?? m)
}
