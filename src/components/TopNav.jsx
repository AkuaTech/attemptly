import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const notifications = [
  { id: 1, icon: 'local_fire_department', tone: 'primary', title: '5-day streak unlocked', body: 'Keep it going — 2 more days for the Bronze badge.', time: '2h ago', unread: true },
  { id: 2, icon: 'warning', tone: 'error', title: 'Thermodynamics accuracy dropped', body: 'Your accuracy fell 12% this week. Want a targeted drill?', time: '6h ago', unread: true },
  { id: 3, icon: 'assignment_add', tone: 'primary', title: 'New PYQ set: JEE Main 2024 Shift 1', body: '30 fresh questions added to your queue.', time: '1d ago', unread: false },
  { id: 4, icon: 'event', tone: 'muted', title: 'Mock #8 scheduled for tomorrow', body: 'Full-length JEE Main Pattern · 9:00 AM.', time: '2d ago', unread: false },
]

const accountItems = [
  { icon: 'person', label: 'My Profile', path: '/profile' },
  { icon: 'tune', label: 'Preferences', path: '/settings' },
  { icon: 'help', label: 'Help & Support', path: '/help' },
]

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)
  const [unreadIds, setUnreadIds] = useState(() => new Set(notifications.filter(n => n.unread).map(n => n.id)))
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
  const unreadCount = unreadIds.size

  function markAllRead() { setUnreadIds(new Set()) }
  function markOneRead(id) {
    setUnreadIds(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev); next.delete(id); return next
    })
  }

  return (
    <header className="topnav">
      <span className="topnav-brand">Prepper</span>

      <div className="topnav-right" ref={wrapRef}>
        <button
          className={`topnav-icon-btn ${open === 'notif' ? 'is-open' : ''}`}
          onClick={() => toggle('notif')}
          aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
          aria-expanded={open === 'notif'}
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && <span className="topnav-badge" aria-hidden="true" />}
        </button>

        {open === 'notif' && (
          <div className="topnav-panel notif-panel" role="dialog" aria-label="Notifications">
            <header className="topnav-panel-head">
              <div>
                <div className="topnav-panel-title">Notifications</div>
                <div className="topnav-panel-sub">
                  {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
                </div>
              </div>
              {unreadCount > 0 && (
                <button className="panel-link-btn" onClick={markAllRead}>Mark all read</button>
              )}
            </header>
            <ul className="notif-list">
              {notifications.map(n => {
                const isUnread = unreadIds.has(n.id)
                return (
                  <li key={n.id}>
                    <button
                      className={`notif-item ${isUnread ? 'unread' : ''}`}
                      onClick={() => markOneRead(n.id)}
                    >
                      <span className={`notif-icon tone-${n.tone}`}>
                        <span className="material-symbols-outlined">{n.icon}</span>
                      </span>
                      <span className="notif-body">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-text">{n.body}</span>
                        <span className="notif-time">{n.time}</span>
                      </span>
                      {isUnread && <span className="notif-dot" aria-hidden="true" />}
                    </button>
                  </li>
                )
              })}
            </ul>
            <footer className="topnav-panel-foot">
              <button className="panel-link-btn">View all activity</button>
            </footer>
          </div>
        )}

        <button
          className={`topnav-icon-btn account-btn ${open === 'account' ? 'is-open' : ''}`}
          onClick={() => toggle('account')}
          aria-label="Account menu"
          aria-expanded={open === 'account'}
        >
          <span className="account-initials">AP</span>
        </button>

        {open === 'account' && (
          <div className="topnav-panel account-panel" role="menu" aria-label="Account">
            <header className="account-head">
              <div className="account-avatar-lg">AP</div>
              <div style={{ minWidth: 0 }}>
                <div className="account-name">Aspirant Pro</div>
                <div className="account-email">aspirant@prepper.app</div>
                <div className="account-tag">JEE Main 2026 · 112-day streak</div>
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
                  onClick={() => { setOpen(null); navigate('/login') }}
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
