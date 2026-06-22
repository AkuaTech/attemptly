import { chapterLabel, formatDurationMs, topicLabel } from '../lib/testAnalytics'

function subjectColor(accuracy) {
  if (accuracy >= 0.7) return 'var(--primary)'
  if (accuracy >= 0.4) return '#f4a261'
  return 'var(--error)'
}

function TopicLine({ topic }) {
  const sub = [topic.subject, chapterLabel(topic.chapter)].filter(Boolean).join(' · ')
  return (
    <li className="tav-topic-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="tav-topic-name">{topicLabel(topic.topic)}</p>
        {sub && <p className="text-micro" style={{ marginTop: 2 }}>{sub}</p>}
      </div>
      <div className="tav-topic-meta">
        <span className="tav-topic-score">{Math.round(topic.accuracy * 100)}%</span>
        <span className="text-micro">{topic.correct}/{topic.total}</span>
      </div>
    </li>
  )
}

export default function TestAnalyticsView({ analytics, title, subtitle, actions, timeLimitMs }) {
  const a = analytics
  const accuracyPct = Math.round(a.accuracy * 100)
  const avgLabel = a.avgSec > 0
    ? a.avgSec >= 60 ? `${(a.avgSec / 60).toFixed(1)}m` : `${Math.round(a.avgSec)}s`
    : '—'

  return (
    <div className="tav">
      <div className="summary-card">
        {title && <p className="text-micro" style={{ marginBottom: 12 }}>{title}</p>}
        <div className="summary-score">{accuracyPct}<span style={{ fontSize: 32 }}>%</span></div>
        <p className="text-sm" style={{ marginTop: 8, color: 'var(--on-sv)' }}>
          {a.correct} of {a.total} correct
        </p>
        {subtitle && <p className="text-micro" style={{ marginTop: 8 }}>{subtitle}</p>}

        <div className="summary-stats">
          <div>
            <div className="summary-stat-label">Correct</div>
            <div className="summary-stat-value" style={{ color: 'var(--primary)' }}>{a.correct}</div>
          </div>
          <div>
            <div className="summary-stat-label">Wrong</div>
            <div className="summary-stat-value" style={{ color: 'var(--error)' }}>{a.wrong}</div>
          </div>
          <div>
            <div className="summary-stat-label">Avg / Q</div>
            <div className="summary-stat-value">{avgLabel}</div>
          </div>
        </div>

        {actions && (
          <div className="row" style={{ justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>

      {a.total > 0 && (
        <>
          {a.subjects.length > 0 && (
            <div className="glass-card editorial-card accent-card tav-block">
              <h3 className="section-label mb-16">Subject Breakdown</h3>
              <div className="tav-subject-list">
                {a.subjects.map(s => (
                  <div key={s.subject} className="tav-subject-row">
                    <div className="tav-subject-head">
                      <span className="tav-subject-name">{s.subject}</span>
                      <span className="text-micro">{s.correct}/{s.total} · {Math.round(s.accuracy * 100)}%</span>
                    </div>
                    <div className="neon-progress-track">
                      <div
                        className="neon-progress-fill"
                        style={{ width: `${Math.round(s.accuracy * 100)}%`, background: subjectColor(s.accuracy) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tav-grid">
            <div className="insight-card primary tav-topic-card">
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', flexShrink: 0 }}>military_tech</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="tav-topic-title">Strength Topics</h4>
                {a.strongTopics.length > 0 ? (
                  <ul className="tav-topic-list">
                    {a.strongTopics.map(t => <TopicLine key={`${t.subject}-${t.chapter}-${t.topic}`} topic={t} />)}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">No standout topics yet. Aim for 80%+ on a topic to see it here.</p>
                )}
              </div>
            </div>

            <div className="insight-card error tav-topic-card">
              <span className="material-symbols-outlined" style={{ color: 'var(--error)', flexShrink: 0 }}>target</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="tav-topic-title">Weak Topics</h4>
                {a.weakTopics.length > 0 ? (
                  <>
                    <ul className="tav-topic-list">
                      {a.weakTopics.map(t => <TopicLine key={`${t.subject}-${t.chapter}-${t.topic}`} topic={t} />)}
                    </ul>
                    <p className="text-micro" style={{ marginTop: 12 }}>Drill these in Subjects to recover ground.</p>
                  </>
                ) : (
                  <p className="text-sm text-muted">No weak spots in this test. Strong work.</p>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card editorial-card accent-card tav-block row" style={{ alignItems: 'center', gap: 16 }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 28 }}>timer</span>
            <div>
              <p className="text-micro">Time Used</p>
              <p className="summary-stat-value">
                {formatDurationMs(a.totalTimeMs)}
                {timeLimitMs > 0 && (
                  <span style={{ fontSize: 14, color: 'var(--on-sv)', fontWeight: 400, marginLeft: 6 }}>
                    / {formatDurationMs(timeLimitMs)}
                  </span>
                )}
              </p>
            </div>
            <div className="spacer" />
            <div className="text-right">
              <p className="text-micro">Avg / Question</p>
              <p className="summary-stat-value">{avgLabel}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
