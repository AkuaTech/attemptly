import { useLocation, useNavigate } from 'react-router-dom'

const links = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/tests', label: 'Mock Tests' },
  { path: '/practice', label: 'Practice' },
  { path: '/subjects', label: 'Subjects' },
  { path: '/analytics', label: 'Analysis' },
]

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <header className="topnav">
      <div className="row" style={{ gap: 0 }}>
        <span className="topnav-brand">Prepper</span>
        <nav className="topnav-links">
          {links.map(l => (
            <button
              key={l.path}
              className={`topnav-link ${location.pathname === l.path ? 'active' : ''}`}
              onClick={() => navigate(l.path)}
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="topnav-right">
        <span className="material-symbols-outlined topnav-icon">notifications</span>
        <span className="material-symbols-outlined topnav-icon">account_circle</span>
      </div>
    </header>
  )
}
