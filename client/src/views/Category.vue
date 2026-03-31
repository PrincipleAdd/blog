<template>
  <div>
    <h1 class="page-heading">📁 {{ categoryName || route.params.slug }}</h1>

    <template v-if="loading">
      <div v-for="i in 3" :key="i" style="padding: 20px 0; border-bottom: 1px solid var(--border);">
        <el-skeleton :rows="2" animated />
      </div>
    </template>

    <div v-else-if="!articles.length" class="empty-state">该分类下暂无文章</div>

    <ul v-else class="post-list">
      <li v-for="article in articles" :key="article.id" class="post-item">
        <div class="post-item-meta">
          <span class="meta-date">{{ formatDate(article.created_at) }}</span>
        </div>
        <h2 class="post-item-title">
          <router-link :to="`/posts/${article.slug}`">{{ article.title }}</router-link>
        </h2>
        <p class="post-item-summary">{{ extractSummary(article.content_md) }}</p>
      </li>
    </ul>

    <div v-if="total > 10" class="pagination">
      <el-pagination v-model:current-page="currentPage" :page-size="10" :total="total"
        layout="prev, pager, next" background @current-change="fetchArticles" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoryArticles } from '../api/categories.js'

const route = useRoute()
const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const loading = ref(false)
const categoryName = ref('')

async function fetchArticles(page = 1) {
  loading.value = true
  try {
    const res = await getCategoryArticles(route.params.slug, page, 10)
    articles.value = res.data.articles || []
    total.value = res.data.total || 0
    categoryName.value = res.data.category?.name || ''
    currentPage.value = page
  } catch { articles.value = [] } finally { loading.value = false }
}

function formatDate(d) { return d ? d.slice(0, 10) : '' }
function extractSummary(md) {
  if (!md) return ''
  return md.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '').replace(/[*_`~>]+/g, '').replace(/\n+/g, ' ').trim().slice(0, 160)
}

onMounted(() => fetchArticles(1))
watch(() => route.params.slug, () => fetchArticles(1))
</script>
