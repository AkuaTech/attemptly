import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import { SkeletonToggleRow } from '../components/Skeleton'
import { cacheGet, cacheSet, cacheIsStale, cacheClear } from '../lib/cache'

const PREF_FIELDS = [
  { key: 'email_daily_summary',     label: 'Daily summary',           sub: 'Yesterday\'s practice and accuracy at 8 AM.', channel: 'email', soon: true },
  { key: 'email_streak_reminder',   label: 'Streak reminder',         sub: 'Email when your streak is about to break.',   channel: 'email', soon: true },
  { key: 'email_weak_topic_alerts', label: 'Weak-topic alerts',       sub: 'When accuracy drops below 60% on a topic.',   channel: 'email', soon: true },
  { key: 'email_new_pyqs',          label: 'Question-bank updates',   sub: 'When new questions are available.',           channel: 'email', soon: true },
  { key: 'push_streak_reminder',    label: 'Push: streak reminder',   sub: 'In-app reminder when your streak is at risk.', channel: 'push', soon: true },
  { key: 'push_test_reminders',     label: 'Push: test reminders',    sub: 'Notify before scheduled custom tests.',       channel: 'push', soon: true },
]

const DEFAULT_PREFS = {
  email_daily_summary: true,
  email_streak_reminder: true,
  email_weak_topic_alerts: true,
  email_new_pyqs: false,
  push_streak_reminder: true,
  push_test_reminders: true,
}

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'account'

  const cacheKey = user ? `settings_prefs_${user.id}` : null
  const cached = cacheKey ? cacheGet(cacheKey) : null
  const [prefs, setPrefs] = useState(cached || DEFAULT_PREFS)
  const [loading, setLoading] = useState(!cached)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || !cacheKey) return
    if (cached && !cacheIsStale(cacheKey)) return
    
    let cancelled = false
    supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err)
        else if (data) {
          const result = { ...DEFAULT_PREFS, ...data }
          cacheSet(cacheKey, result)
          setPrefs(result)
        }
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [user, cacheKey, cached])

  async function togglePref(key) {
    if (!user) return
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaving(true); setError(null)
    const { error: err } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...next }, { onConflict: 'user_id' })
    setSaving(false)
    if (err) { setError(err); return }
    if (cacheKey) cacheSet(cacheKey, next)
    setSavedAt(Date.now())
  }

  function setTab(t) { setParams({ tab: t }) }

  return (
    <div className="page-canvas">
      <header style={{ marginBottom: 32 }}>
        <button
          className="btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px', marginBottom: 20 }}
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </button>
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage account, notifications, and study preferences.</p>
      </header>

      <div className="settings-tabs">
        {[
          { id: 'account', label: 'Account' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'study', label: 'Study' },
        ].map(t => (
          <button key={t.id} className={`settings-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'account' && (
        <div className="glass-card editorial-card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Account</h3>
          <p className="text-sm" style={{ marginBottom: 24, color: 'var(--on-sv)' }}>
            Edit your name, target exam, and class on the profile page.
          </p>
          <button className="btn-outline" style={{ padding: '12px 16px', borderRadius: 10 }} onClick={() => navigate('/profile')}>
            Open Profile
          </button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="glass-card editorial-card">
          <div className="row" style={{ marginBottom: 16 }}>
            <h3 className="section-title flex-1">Notifications</h3>
            {saving ? <span className="text-micro">Saving…</span>
              : savedAt ? <span className="text-micro text-primary">Saved</span>
              : null}
          </div>
          {error && <p className="form-error" style={{ marginBottom: 16 }}>{error.message}</p>}
          {loading ? (
            <>
              <h4 className="text-micro" style={{ margin: '8px 0 12px' }}>Email</h4>
              <SkeletonToggleRow />
              <SkeletonToggleRow />
              <SkeletonToggleRow />
              <h4 className="text-micro" style={{ margin: '24px 0 12px' }}>In-app push</h4>
              <SkeletonToggleRow />
              <SkeletonToggleRow />
            </>
          ) : (
            <>
              <h4 className="text-micro" style={{ margin: '8px 0 12px' }}>Email</h4>
              {PREF_FIELDS.filter(f => f.channel === 'email').map(f => (
                <ToggleRow key={f.key} field={f} value={prefs[f.key]} onToggle={() => togglePref(f.key)} />
              ))}
              <h4 className="text-micro" style={{ margin: '24px 0 12px' }}>In-app push</h4>
              {PREF_FIELDS.filter(f => f.channel === 'push').map(f => (
                <ToggleRow key={f.key} field={f} value={prefs[f.key]} onToggle={() => togglePref(f.key)} />
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'study' && (
        <div className="glass-card editorial-card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Study Preferences</h3>
          <p className="text-sm" style={{ color: 'var(--on-sv)' }}>
            Per-subject difficulty filters and daily question goals are coming soon.
          </p>
        </div>
      )}
    </div>
  )
}

function ToggleRow({ field, value, onToggle }) {
  const soon = !!field.soon
  return (
    <div className="toggle-row" style={soon ? { opacity: 0.55 } : undefined}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="toggle-label">
          {field.label}
          {soon && <span className="chip" style={{ marginLeft: 8, fontSize: 9, color: 'var(--primary)', borderColor: 'var(--primary-mid)' }}>coming soon</span>}
        </div>
        <div className="toggle-sub">{field.sub}</div>
      </div>
      <button
        className={`toggle-switch ${value ? 'on' : ''}`}
        onClick={soon ? undefined : onToggle}
        disabled={soon}
        aria-pressed={value}
        aria-label={field.label}
        style={soon ? { cursor: 'default' } : undefined}
      />
    </div>
  )
}
