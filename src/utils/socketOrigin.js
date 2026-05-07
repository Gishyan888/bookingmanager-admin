/** HTTP origin for Socket.IO (strip trailing `/api` from API base URL). */
export function getSocketOrigin() {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  const trimmed = raw.replace(/\/+$/, '')
  const origin = trimmed.replace(/\/api$/i, '')
  return origin || 'http://localhost:3000'
}
