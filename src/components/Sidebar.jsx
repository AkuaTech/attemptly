import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'quiz', label: 'Mock Tests', path: '/tests' },
  { icon: 'insights', label: 'Analysis', path: '/analytics' },
  { icon: 'auto_stories', label: 'Subjects', path: '/subjects' },
  { icon: 'event', label: 'Schedule', path: '/schedule' },
]

function getInitials(user) {
  if (!user) return '?'
  const name = user.user_metadata?.full_name || user.email || ''
  if (name.includes('@')) return name[0].toUpperCase()
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getDisplayName(user) {
  if (!user) return 'Guest'
  return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">{getInitials(user)}</div>
          <div>
            <div className="sidebar-user-name">{getDisplayName(user)}</div>
            <div className="sidebar-user-sub">JEE Main 2026</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!user ? (
          <div className="sidebar-auth-card">
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>100% free, forever.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="sidebar-signin-btn" onClick={() => navigate('/login')}>Sign In</button>
              <button className="sidebar-signup-btn" onClick={() => navigate('/signup')}>Create Account</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0 8px', marginBottom: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
        )}
        <button className="sidebar-item" onClick={() => {}}>
          <span className="material-symbols-outlined">settings</span>
          Settings
        </button>
        {user && (
          <button className="sidebar-item" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        )}
      </div>
    </aside>
  )
}
