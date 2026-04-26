import { useLocation, useNavigate } from 'react-router-dom'

const items = [
  { icon: 'home', label: 'Home', path: '/dashboard' },
  { icon: 'assignment', label: 'Tests', path: '/tests' },
  { icon: 'auto_stories', label: 'Subjects', path: '/subjects' },
  { icon: 'analytics', label: 'Analysis', path: '/analytics' },
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
          aria-label={item.label}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
