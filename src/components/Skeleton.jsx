export function Skeleton({ w, h, r, style }) {
  return <div className="skeleton" style={{ width: w || '100%', height: h || 16, borderRadius: r || 8, ...style }} />
}

export function SkeletonLine({ w, style }) {
  return <Skeleton w={w || '100%'} h={12} style={style} />
}

export function SkeletonStatCard() {
  return (
    <div className="glass-card stat-card">
      <Skeleton w={64} h={10} r={4} style={{ marginBottom: 14 }} />
      <Skeleton w={80} h={32} r={6} />
    </div>
  )
}

export function SkeletonCard({ lines = 3, h }) {
  return (
    <div className="glass-card editorial-card" style={h ? { minHeight: h } : undefined}>
      <Skeleton w={120} h={12} style={{ marginBottom: 16 }} />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} w={i === lines - 1 ? '60%' : '100%'} h={10} style={{ marginBottom: 10 }} />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="weakness-row" style={{ gap: 12 }}>
      <div className="row" style={{ flex: 1, gap: 12 }}>
        <Skeleton w={32} h={32} r={8} />
        <div style={{ flex: 1 }}>
          <Skeleton w="60%" h={12} style={{ marginBottom: 6 }} />
          <Skeleton w="40%" h={10} />
        </div>
      </div>
      <Skeleton w={48} h={24} r={8} />
    </div>
  )
}

export function SkeletonTestRow() {
  return (
    <div className="glass-card test-row">
      <Skeleton w={40} h={40} r={10} />
      <div className="flex-1">
        <Skeleton w="50%" h={14} style={{ marginBottom: 8 }} />
        <Skeleton w="70%" h={10} />
      </div>
      <Skeleton w={64} h={28} r={8} />
    </div>
  )
}

export function SkeletonGridCard() {
  return (
    <div className="glass-card curriculum-card" style={{ minHeight: 180 }}>
      <Skeleton w={48} h={48} r={8} style={{ marginBottom: 20 }} />
      <Skeleton w="70%" h={16} style={{ marginBottom: 8 }} />
      <Skeleton w="40%" h={10} style={{ marginBottom: 24 }} />
      <Skeleton w="100%" h={36} r={8} />
    </div>
  )
}

export function SkeletonToggleRow() {
  return (
    <div className="toggle-row">
      <div style={{ flex: 1 }}>
        <Skeleton w="40%" h={14} style={{ marginBottom: 6 }} />
        <Skeleton w="65%" h={10} />
      </div>
      <Skeleton w={40} h={22} r={11} />
    </div>
  )
}

export function SkeletonNoteCard() {
  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <Skeleton w="45%" h={15} style={{ marginBottom: 8 }} />
      <Skeleton w="30%" h={10} style={{ marginBottom: 10 }} />
      <Skeleton w="90%" h={10} style={{ marginBottom: 6 }} />
      <Skeleton w="70%" h={10} />
    </div>
  )
}

export function SkeletonPractice() {
  return (
    <div className="practice-wrap">
      <div className="practice-bar">
        <Skeleton w={36} h={36} r={8} />
        <div className="practice-progress"><div style={{ width: '30%', height: '100%', background: 'var(--sc-bright)', borderRadius: 3 }} /></div>
        <Skeleton w={40} h={14} />
      </div>
      <Skeleton w={120} h={10} style={{ marginBottom: 16 }} />
      <div className="question-card">
        <Skeleton w="100%" h={14} style={{ marginBottom: 10 }} />
        <Skeleton w="85%" h={14} style={{ marginBottom: 10 }} />
        <Skeleton w="60%" h={14} style={{ marginBottom: 28 }} />
        {['A', 'B', 'C', 'D'].map(l => (
          <div key={l} className="option-chip" style={{ cursor: 'default' }}>
            <Skeleton w={28} h={28} r={8} />
            <Skeleton w="70%" h={14} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonPage({ children }) {
  return <div className="page-canvas">{children}</div>
}
