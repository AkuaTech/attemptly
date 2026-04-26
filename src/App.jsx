import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18, color: 'var(--muted)', letterSpacing: '0.1em' }}>Loading...</span>
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

function AppLayout() {
  return (
    <div className="layout">
      <TopNav />
      <Sidebar />
      <div className="main-area">
        <Routes>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tests" element={<MockTests />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:subject" element={<ChaptersList />} />
          <Route path="/subjects/:subject/:chapter" element={<TopicsList />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
