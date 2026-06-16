import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserDisplayName, getUserInitials } from '../lib/userProfile'

const accountItems = [
  { icon: 'person', label: 'My Profile', path: '/profile' },
  { icon: 'tune', label: 'Preferences', path: '/settings' },
  { icon: 'help', label: 'Help & Support', path: '/help' },
]

export default function TopNav({ theme, toggleTheme }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null)
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => { setOpen(null) }, [location.pathname])

  const toggle = panel => setOpen(p => p === panel ? null : panel)

  return (
    <header className="topnav">
      <span className="topnav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Prepper</span>

      <div className="topnav-right" ref={wrapRef}>
        <button
          className="topnav-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button
          className={`topnav-icon-btn ${open === 'notif' ? 'is-open' : ''}`}
          onClick={() => toggle('notif')}
          aria-label="Notifications"
          aria-expanded={open === 'notif'}
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {open === 'notif' && (
          <div className="topnav-panel notif-panel" role="dialog" aria-label="Notifications">
            <header className="topnav-panel-head">
              <div>
                <div className="topnav-panel-title">Notifications</div>
                <div className="topnav-panel-sub">No notifications yet</div>
              </div>
            </header>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--muted)' }}>notifications_off</span>
              <p className="text-sm" style={{ marginTop: 8 }}>
                Streak alerts and test reminders will show up here.
              </p>
            </div>
            <footer className="topnav-panel-foot">
              <button className="panel-link-btn" onClick={() => { setOpen(null); navigate('/analytics') }}>
                View all activity
              </button>
            </footer>
          </div>
        )}

        <button
          className={`topnav-icon-btn account-btn ${open === 'account' ? 'is-open' : ''}`}
          onClick={() => toggle('account')}
          aria-label="Account menu"
          aria-expanded={open === 'account'}
        >
          <span className="account-initials">{getUserInitials(user)}</span>
        </button>

        {open === 'account' && (
          <div className="topnav-panel account-panel" role="menu" aria-label="Account">
            <header className="account-head">
              <div className="account-avatar-lg">{getUserInitials(user)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="account-name">{getUserDisplayName(user)}</div>
                <div className="account-email">{user?.email || ''}</div>
                <div className="account-tag">{user?.user_metadata?.target_exam || 'JEE Main 2026'}</div>
              </div>
            </header>
            <ul className="account-menu">
              {accountItems.map(item => (
                <li key={item.label}>
                  <button
                    className="account-menu-item"
                    onClick={() => { setOpen(null); navigate(item.path) }}
                    role="menuitem"
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
              <li className="account-menu-divider" aria-hidden="true" />
              <li>
                <button
                  className="account-menu-item danger"
                  onClick={async () => { setOpen(null); await signOut(); navigate('/login') }}
                  role="menuitem"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span>Sign out</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
