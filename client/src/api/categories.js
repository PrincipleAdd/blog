import api from './index.js'

export function getCategories() {
  return api.get('/api/categories')
}

export function getCategoryArticles(slug, page = 1, pageSize = 10) {
  return api.get(`/api/categories/${slug}`, { params: { page, pageSize } })
}

export function createCategory(name) {
  return api.post('/api/admin/categories', { name })
}

export function deleteCategory(id) {
  return api.delete(`/api/admin/categories/${id}`)
}
