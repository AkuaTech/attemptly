import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import TopNav from './components/TopNav'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import QuestionView from './pages/QuestionView'
import Analytics from './pages/Analytics'
import MockTests from './pages/MockTests'
import Subjects from './pages/Subjects'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'

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
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
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
          <Route path="/practice" element={<QuestionView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tests" element={<MockTests />} />
          <Route path="/subjects" element={<Subjects />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
