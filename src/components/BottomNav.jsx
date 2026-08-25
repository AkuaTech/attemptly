import { useLocation, useNavigate } from 'react-router-dom'
import { SquaresFour, Exam, BookOpen, CalendarBlank, NotePencil, ChartLineUp } from '@phosphor-icons/react'

const items = [
  { icon: SquaresFour, label: 'Home', path: '/dashboard' },
  { icon: Exam, label: 'Tests', path: '/tests' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: CalendarBlank, label: 'Planner', path: '/schedule' },
  { icon: NotePencil, label: 'Notes', path: '/notes' },
  { icon: ChartLineUp, label: 'Analysis', path: '/analytics' },
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
          <item.icon size={18} weight={location.pathname === item.path ? 'fill' : 'regular'} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
