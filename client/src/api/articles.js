import api from './index.js'

export function getArticles(page = 1, pageSize = 10) {
  return api.get('/api/articles', { params: { page, pageSize } })
}

export function getArticle(slug) {
  return api.get(`/api/articles/${slug}`)
}

export function getAdminArticles(page = 1, pageSize = 10) {
  return api.get('/api/admin/articles', { params: { page, pageSize } })
}

export function createArticle(data) {
  return api.post('/api/admin/articles', data)
}

export function updateArticle(id, data) {
  return api.put(`/api/admin/articles/${id}`, data)
}

export function deleteArticle(id) {
  return api.delete(`/api/admin/articles/${id}`)
}
