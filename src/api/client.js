import axios from 'axios'
import toast from 'react-hot-toast'
import { translateApiErrorMessage } from '../utils/apiErrorI18n'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bm_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    const url = err?.config?.url || ''
    const rawMessage = err?.response?.data?.message ?? err?.message
    const text = translateApiErrorMessage(rawMessage)

    // Don't show toast on 401 from /auth/me (silent session check)
    const silent = status === 401 && url.includes('/auth/me')
    if (!silent) {
      toast.error(text)
    }

    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('bm_token')
      localStorage.removeItem('bm_user')
      if (!url.includes('/auth/me')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  },
)

export const setAuthToken = (token) => {
  if (token) localStorage.setItem('bm_token', token)
  else localStorage.removeItem('bm_token')
}
