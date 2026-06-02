import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserDisplayName, getUserInitials } from '../lib/userProfile'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'quiz', label: 'Mock Tests', path: '/tests' },
  { icon: 'insights', label: 'Analysis', path: '/analytics' },
  { icon: 'auto_stories', label: 'Subjects', path: '/subjects' },
  { icon: 'event', label: 'Schedule', path: '/schedule' },
]

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
          <div className="sidebar-avatar">{getUserInitials(user)}</div>
          <div>
            <div className="sidebar-user-name">{getUserDisplayName(user)}</div>
            <div className="sidebar-user-sub">{user?.user_metadata?.target_exam || 'JEE Main 2026'}</div>
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
            <p className="text-micro text-muted mb-12">100% free, forever.</p>
            <div className="flex-col gap-8">
              <button className="sidebar-signin-btn" onClick={() => navigate('/login')}>Sign In</button>
              <button className="sidebar-signup-btn" onClick={() => navigate('/signup')}>Create Account</button>
            </div>
          </div>
        ) : (
          <div className="px-8 mb-8 overflow-hidden">
            <p className="text-micro text-muted" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
        )}
        <button
          className={`sidebar-item ${location.pathname === '/settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
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
