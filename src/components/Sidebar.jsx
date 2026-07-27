import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  SquaresFour,
  Exam,
  ChartLineUp,
  BookOpen,
  Calendar,
  Notepad,
  Gear,
  SignOut,
  CaretLeft,
  CaretRight,
  Student,
} from '@phosphor-icons/react'
import { useAuth } from '../contexts/AuthContext'
import { getUserDisplayName, getUserInitials } from '../lib/userProfile'

const navItems = [
  { icon: SquaresFour, label: 'Dashboard', path: '/dashboard' },
  { icon: Exam, label: 'Mock Tests', path: '/tests' },
  { icon: ChartLineUp, label: 'Analysis', path: '/analytics' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: Calendar, label: 'Schedule', path: '/schedule' },
  { icon: Notepad, label: 'Notes', path: '/notes' },
]

const testPaths = ['/practice', '/tests/result', '/tests/', '/review']

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const isTestScreen = testPaths.some(p => location.pathname.startsWith(p))
  const [collapsed, setCollapsed] = useState(isTestScreen)

  useEffect(() => {
    setCollapsed(testPaths.some(p => location.pathname.startsWith(p)))
  }, [location.pathname])

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const ToggleIcon = collapsed ? CaretRight : CaretLeft

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Toggle button */}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ToggleIcon size={16} weight="bold" />
        </button>

        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {getUserInitials(user)}
              <Student size={14} weight="bold" className="sidebar-avatar-icon" />
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{getUserDisplayName(user)}</div>
                <div className="sidebar-user-sub">{user?.user_metadata?.target_exam || 'JEE Main 2026'}</div>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          {!user ? (
            <div className="sidebar-auth-card">
              {!collapsed && <p className="text-micro text-muted mb-12">No ads. No premium tier.</p>}
              <div className="flex-col gap-8">
                <button className="sidebar-signin-btn" onClick={() => navigate('/login')}>
                  {collapsed ? 'In' : 'Sign In'}
                </button>
                <button className="sidebar-signup-btn" onClick={() => navigate('/signup')}>
                  {collapsed ? 'Up' : 'Create Account'}
                </button>
              </div>
            </div>
          ) : (
            <div className="px-8 mb-8 overflow-hidden">
              {!collapsed && (
                <p className="text-micro text-muted" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </p>
              )}
            </div>
          )}
          <button
            className={`sidebar-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
            title={collapsed ? 'Settings' : undefined}
          >
            <Gear size={20} weight={location.pathname === '/settings' ? 'fill' : 'regular'} />
            {!collapsed && <span>Settings</span>}
          </button>
          {user && (
            <button className="sidebar-item" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
              <SignOut size={20} />
              {!collapsed && <span>Logout</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Spacer that collapses with sidebar */}
      <div className={`sidebar-spacer ${collapsed ? 'collapsed' : ''}`} />
    </>
  )
}
