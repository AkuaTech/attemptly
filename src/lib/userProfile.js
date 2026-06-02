export function getUserInitials(user) {
  if (!user) return '?'

  const name = user.user_metadata?.full_name || user.email || ''
  if (name.includes('@')) return name[0].toUpperCase()

  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

export function getUserDisplayName(user) {
  if (!user) return 'Guest'

  return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
}
