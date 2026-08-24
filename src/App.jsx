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
import TestResult from './pages/TestResult'
import TestHistory from './pages/TestHistory'
import CustomTest from './pages/CustomTest'
import Notes from './pages/Notes'
import Tour from './components/Tour'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-dot" />
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
  const location = useLocation()
  const { user } = useAuth()
  const hideNav = location.pathname === '/practice'
  const [tour, setTour] = useState(() => user && !localStorage.getItem(`tour_${user.id}`))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <div className="layout">
      <a href="#main-content" className="sr-only">Skip to content</a>
      <ScrollToTop />
      {!hideNav && <TopNav theme={theme} toggleTheme={toggleTheme} />}
      {!hideNav && <Sidebar />}
      {tour && user && (
        <Tour onDone={() => { localStorage.setItem(`tour_${user.id}`, '1'); setTour(false) }} />
      )}
      <div className={`main-area ${hideNav ? 'focus-mode' : ''}`} id="main-content">
        <Routes>
          <Route index element={<Navigate to="/practice" replace />} />
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
          <Route path="/tests/history" element={<TestHistory />} />
          <Route path="/tests/result/:attemptId" element={<TestResult />} />
          <Route path="/tests/:id/review" element={<TestReview />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}
