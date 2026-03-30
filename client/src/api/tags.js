import api from './index.js'

export function getTags() {
  return api.get('/api/tags')
}

export function getTagArticles(slug, page = 1, pageSize = 10) {
  return api.get(`/api/tags/${slug}`, { params: { page, pageSize } })
}

export function createTag(name) {
  return api.post('/api/admin/tags', { name })
}

export function deleteTag(id) {
  return api.delete(`/api/admin/tags/${id}`)
}
