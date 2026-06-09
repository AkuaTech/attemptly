import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import TopNav from './components/TopNav'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import MockTests from './pages/MockTests'
import Subjects from './pages/Subjects'
import ChaptersList from './pages/ChaptersList'
import TopicsList from './pages/TopicsList'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Schedule from './pages/Schedule'
import Help from './pages/Help'
import Practice from './pages/Practice'
import TestReview from './pages/TestReview'
import CustomTest from './pages/CustomTest'
import Notes from './pages/Notes'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <span className="text-bold text-muted" style={{ fontFamily: 'var(--fh)', fontSize: 18, letterSpacing: '0.1em' }}>Loading...</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/*" element={user ? <AppLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <div className="layout">
      <a href="#main-content" className="sr-only">Skip to content</a>
      <ScrollToTop />
      <TopNav theme={theme} toggleTheme={toggleTheme} />
      <Sidebar />
      <div className="main-area" id="main-content">
        <Routes>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tests" element={<MockTests />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:subject" element={<ChaptersList />} />
          <Route path="/subjects/:subject/:chapter" element={<TopicsList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/help" element={<Help />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/tests/custom" element={<CustomTest />} />
          <Route path="/tests/:id/review" element={<TestReview />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
