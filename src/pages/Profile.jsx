import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'
import Modal from '../components/Modal'

const TARGET_EXAMS = [
  'JEE Main 2026',
  'JEE Main 2027',
  'JEE Advanced 2026',
  'JEE Advanced 2027',
  // 'NEET 2026',
  // 'NEET 2027',
]
const CLASS_OPTIONS = ['Class 11th', 'Class 12th', 'Dropper', 'College']

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const meta = user?.user_metadata || {}
  const [fullName, setFullName] = useState(meta.full_name || '')
  const [targetExam, setTargetExam] = useState(meta.target_exam || 'JEE Main 2026')
  const [classYear, setClassYear] = useState(meta.class_year || 'Class 11th')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  const [pwOpen, setPwOpen] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwErr, setPwErr] = useState(null)
  const [pwOk, setPwOk] = useState(false)

  const [delOpen, setDelOpen] = useState(false)
  const [delConfirm, setDelConfirm] = useState('')
  const [delBusy, setDelBusy] = useState(false)
  const [delErr, setDelErr] = useState(null)

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true); setProfileMsg(null)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, target_exam: targetExam, class_year: classYear },
    })
    setSavingProfile(false)
    setProfileMsg(error ? { type: 'error', text: error.message } : { type: 'ok', text: 'Saved.' })
    if (!error) setTimeout(() => setProfileMsg(null), 2500)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwErr(null); setPwOk(false)
    if (newPw.length < 6) { setPwErr('Password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setPwErr('Passwords do not match.'); return }
    setPwBusy(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwBusy(false)
    if (error) { setPwErr(error.message); return }
    setPwOk(true); setNewPw(''); setConfirmPw('')
    setTimeout(() => { setPwOpen(false); setPwOk(false) }, 1200)
  }

  async function handleDelete() {
    setDelErr(null); setDelBusy(true)
    const { error } = await supabase.rpc('delete_my_account')
    if (error) { setDelErr(error.message); setDelBusy(false); return }
    await signOut()
    navigate('/login', { replace: true })
  }

  const initial = (fullName || user?.email || 'P').charAt(0).toUpperCase()

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
        <form
          onSubmit={handleSaveProfile}
          className="glass-card editorial-card accent-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(231,249,92,0.1)', border: '1px solid rgba(231,249,92,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 32, color: 'var(--primary)'
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: 'var(--fh)', fontSize: 24, fontWeight: 700, marginBottom: 4, lineHeight: 1.1 }}>
                {fullName || 'Add your name'}
              </h2>
              <p style={{ color: 'var(--on-sv)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className="form-row">
            <label className="text-micro">Full Name</label>
            <input
              className="form-input"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="form-row">
            <label className="text-micro">Target Exam</label>
            <select
              className="form-select"
              value={targetExam}
              onChange={e => setTargetExam(e.target.value)}
            >
              {TARGET_EXAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="text-micro">Current Status</label>
            <select
              className="form-select"
              value={classYear}
              onChange={e => setClassYear(e.target.value)}
            >
              {CLASS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="row" style={{ marginTop: 24, gap: 16 }}>
            <button type="submit" className="login-enter-btn" style={{ flex: 1, margin: 0 }} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
            {profileMsg && (
              <span style={{ fontSize: 13, color: profileMsg.type === 'error' ? 'var(--error)' : 'var(--primary)' }}>
                {profileMsg.text}
              </span>
            )}
          </div>
        </form>

        <div className="profile-side">
          <div className="glass-card editorial-card accent-card profile-settings-card">
            <h3 className="section-title" style={{ marginBottom: 24 }}>Account Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                className="btn-outline"
                style={{ width: '100%', padding: '16px', borderRadius: 12, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => { setPwErr(null); setPwOk(false); setNewPw(''); setConfirmPw(''); setPwOpen(true) }}
              >
                <span style={{ fontSize: 14 }}>Change Password</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ width: '100%', padding: '16px', borderRadius: 12, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => navigate('/settings?tab=notifications')}
              >
                <span style={{ fontSize: 14 }}>Notification Preferences</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
            </div>
          </div>

          <div className="glass-card editorial-card profile-danger-card">
            <h3 className="section-title" style={{ color: 'var(--error)', marginBottom: 8 }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--on-sv)', marginBottom: 24 }}>
              Permanently delete your account and all associated data.
            </p>
            <button
              type="button"
              className="btn-outline"
              style={{ width: '100%', padding: '16px', borderRadius: 12, color: 'var(--error)', borderColor: 'rgba(255,113,81,0.3)', background: 'transparent' }}
              onClick={() => { setDelErr(null); setDelConfirm(''); setDelOpen(true) }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title="Change Password"
        footer={
          <>
            <button className="btn-outline" style={{ padding: '10px 16px', borderRadius: 10 }} onClick={() => setPwOpen(false)}>Cancel</button>
            <button className="login-enter-btn" style={{ padding: '10px 20px', margin: 0, width: 'auto' }} onClick={handleChangePassword} disabled={pwBusy}>
              {pwBusy ? 'Saving…' : 'Update'}
            </button>
          </>
        }
      >
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="form-row">
            <label className="text-micro">New Password</label>
            <input className="form-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} minLength={6} required />
          </div>
          <div className="form-row">
            <label className="text-micro">Confirm Password</label>
            <input className="form-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} minLength={6} required />
          </div>
          {pwErr && <p className="form-error" style={{ marginTop: 12 }}>{pwErr}</p>}
          {pwOk && <p style={{ marginTop: 12, color: 'var(--primary)', fontSize: 13 }}>Password updated.</p>}
          <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
        </form>
      </Modal>

      <Modal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        title="Delete Account"
        footer={
          <>
            <button className="btn-outline" style={{ padding: '10px 16px', borderRadius: 10 }} onClick={() => setDelOpen(false)}>Cancel</button>
            <button
              className="login-enter-btn"
              style={{ padding: '10px 20px', margin: 0, width: 'auto', background: 'var(--error)', color: 'var(--on-primary)' }}
              onClick={handleDelete}
              disabled={delBusy || delConfirm !== 'DELETE'}
            >
              {delBusy ? 'Deleting…' : 'Delete forever'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--on-sv)', lineHeight: 1.6, marginBottom: 16 }}>
          This will permanently delete your account, your practice history, attempts, and all preferences. This cannot be undone.
        </p>
        <div className="form-row">
          <label className="text-micro">Type <strong style={{ color: 'var(--error)' }}>DELETE</strong> to confirm</label>
          <input className="form-input" value={delConfirm} onChange={e => setDelConfirm(e.target.value)} placeholder="DELETE" />
        </div>
        {delErr && <p className="form-error" style={{ marginTop: 12 }}>{delErr}</p>}
      </Modal>
    </div>
  )
}
