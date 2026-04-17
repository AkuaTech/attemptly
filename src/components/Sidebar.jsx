import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'quiz', label: 'Mock Tests', path: '/tests' },
  { icon: 'menu_book', label: 'Practice', path: '/practice' },
  { icon: 'insights', label: 'Analysis', path: '/analytics' },
  { icon: 'auto_stories', label: 'Subjects', path: '/subjects' },
  { icon: 'event', label: 'Schedule', path: '/schedule' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">AP</div>
          <div>
            <div className="sidebar-user-name">Aspirant Pro</div>
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
        <div className="sidebar-auth-card">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>100% free - forever.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="sidebar-signin-btn" onClick={() => navigate('/login')}>Sign In</button>
            <button className="sidebar-signup-btn" onClick={() => navigate('/onboarding')}>Create Account</button>
          </div>
        </div>
        <button className="sidebar-item" onClick={() => {}}>
          <span className="material-symbols-outlined">settings</span>
          Settings
        </button>
        <button className="sidebar-item" onClick={() => navigate('/login')}>
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
