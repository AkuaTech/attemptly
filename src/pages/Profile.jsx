import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="page-canvas">
      <header style={{ marginBottom: 48 }}>
        <h1 className="page-title">
          Your <span style={{ color: 'var(--primary)' }}>Profile.</span>
        </h1>
        <p className="page-sub">
          Manage your personal information and exam preferences.
        </p>
      </header>

      <div className="bento-5">
        <div className="glass-card" style={{ padding: 40, borderRadius: 24, border: '0.5px solid rgba(72,72,71,0.15)', background: 'rgba(20,20,20,0.7)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(231,249,92,0.1)', border: '1px solid rgba(231,249,92,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 32, color: 'var(--primary)'
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--fh)', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
                {user?.user_metadata?.full_name || 'Student Name'}
              </h2>
              <p style={{ color: 'var(--on-sv)', fontSize: 15 }}>
                {user?.email || 'student@example.com'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'var(--sc-low)', padding: 24, borderRadius: 16, border: '0.5px solid rgba(72,72,71,0.15)' }}>
               <label className="text-micro" style={{ display: 'block', marginBottom: 8 }}>Target Exam</label>
               <div style={{ fontFamily: 'var(--fh)', fontSize: 18, fontWeight: 700 }}>JEE Advanced 2026</div>
            </div>
            <div style={{ background: 'var(--sc-low)', padding: 24, borderRadius: 16, border: '0.5px solid rgba(72,72,71,0.15)' }}>
               <label className="text-micro" style={{ display: 'block', marginBottom: 8 }}>Current Status</label>
               <div style={{ fontFamily: 'var(--fh)', fontSize: 18, fontWeight: 700 }}>Class 11th</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 32, borderRadius: 24, border: '0.5px solid rgba(72,72,71,0.15)', flex: 1, background: 'rgba(20,20,20,0.7)', backdropFilter: 'blur(20px)' }}>
            <h3 className="section-title" style={{ marginBottom: 24 }}>Account Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-outline" style={{ width: '100%', padding: '16px', borderRadius: 12, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>Change Password</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
              <button className="btn-outline" style={{ width: '100%', padding: '16px', borderRadius: 12, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>Notification Preferences</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: 32, borderRadius: 24, border: '0.5px solid rgba(255,113,81,0.15)', background: 'rgba(255,113,81,0.02)' }}>
            <h3 className="section-title" style={{ color: 'var(--error)', marginBottom: 8 }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--on-sv)', marginBottom: 24 }}>
              Permanently delete your account and all associated data.
            </p>
            <button className="btn-outline" style={{ width: '100%', padding: '16px', borderRadius: 12, color: 'var(--error)', borderColor: 'rgba(255,113,81,0.3)', background: 'transparent' }}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}