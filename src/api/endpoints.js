import { api } from './client'

export const auth = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  verifyEmailOtp: (data) =>
    api.post('/auth/verify-email-otp', data).then((r) => r.data),
  resendEmailOtp: (data) =>
    api.post('/auth/resend-email-otp', data).then((r) => r.data),
  requestPasswordReset: (data) =>
    api.post('/auth/forgot-password/request', data).then((r) => r.data),
  confirmPasswordReset: (data) =>
    api.post('/auth/forgot-password/confirm', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

export const dashboard = {
  stats: () => api.get('/dashboard').then((r) => r.data),
}

export const users = {
  me: () => api.get('/users/me').then((r) => r.data),
  updateMe: (data) => api.patch('/users/me', data).then((r) => r.data),
  listOwners: (params) =>
    api.get('/users/owners', { params }).then((r) => r.data),
  myManagers: (params) =>
    api.get('/users/my-managers', { params }).then((r) => r.data),
  createMyManager: (data) =>
    api.post('/users/my-managers', data).then((r) => r.data),
  updateMyManager: (id, data) =>
    api.patch(`/users/my-managers/${id}`, data).then((r) => r.data),
  activateMyManager: (id) =>
    api.patch(`/users/my-managers/${id}/activate`).then((r) => r.data),
  deactivateMyManager: (id) =>
    api.patch(`/users/my-managers/${id}/deactivate`).then((r) => r.data),
  removeMyManager: (id) =>
    api.delete(`/users/my-managers/${id}`).then((r) => r.data),
  create: (data) => api.post('/users', data).then((r) => r.data),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data),
  update: (id, data) => api.patch(`/users/${id}`, data).then((r) => r.data),
  activate: (id) => api.patch(`/users/${id}/activate`).then((r) => r.data),
  deactivate: (id) =>
    api.patch(`/users/${id}/deactivate`).then((r) => r.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
}

export const hotels = {
  list: (params) => api.get('/hotels', { params }).then((r) => r.data),
  get: (id) => api.get(`/hotels/${id}`).then((r) => r.data),
  create: (data) => api.post('/hotels', data).then((r) => r.data),
  update: (id, data) => api.patch(`/hotels/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/hotels/${id}`).then((r) => r.data),
  assignOwner: (id, ownerId) =>
    api.post(`/hotels/${id}/assign-owner`, { ownerId }).then((r) => r.data),
}

export const rooms = {
  list: (params) => api.get('/rooms', { params }).then((r) => r.data),
  get: (id) => api.get(`/rooms/${id}`).then((r) => r.data),
  create: (data) => api.post('/rooms', data).then((r) => r.data),
  update: (id, data) => api.patch(`/rooms/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/rooms/${id}`).then((r) => r.data),
}

export const customers = {
  list: (params) => api.get('/customers', { params }).then((r) => r.data),
  get: (id) => api.get(`/customers/${id}`).then((r) => r.data),
  create: (data) => api.post('/customers', data).then((r) => r.data),
  update: (id, data) =>
    api.patch(`/customers/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/customers/${id}`).then((r) => r.data),
}

export const bookings = {
  list: (params) => api.get('/bookings', { params }).then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  create: (data) => api.post('/bookings', data).then((r) => r.data),
  update: (id, data) => api.patch(`/bookings/${id}`, data).then((r) => r.data),
  setStatus: (id, status) =>
    api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/bookings/${id}`).then((r) => r.data),
}

export const notifications = {
  list: (params) =>
    api.get('/notifications', { params }).then((r) => r.data),
  unreadCount: () =>
    api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
}
