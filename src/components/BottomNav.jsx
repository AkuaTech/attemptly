import { useLocation, useNavigate } from 'react-router-dom'

const items = [
  { icon: 'home', label: 'Home', path: '/dashboard' },
  { icon: 'assignment', label: 'Tests', path: '/tests' },
  { icon: 'auto_stories', label: 'Library', path: '/subjects' },
  { icon: 'person', label: 'Profile', path: '/profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.path}
          className={`bnav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{item.icon}</span>
          {location.pathname !== item.path && <span>{item.label}</span>}
        </button>
      ))}
    </nav>
  )
}
