import api from './index.js'

export function login(username, password) {
  return api.post('/api/auth/login', { username, password })
}

export function getProfile() {
  return api.get('/api/auth/profile')
}
