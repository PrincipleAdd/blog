<template>
  <div class="public-main">
    <h2 style="margin-bottom: 20px; color: #222;">
      标签：{{ tagName || route.params.slug }}
    </h2>

    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="post-card">
        <el-skeleton :rows="3" animated />
      </div>
    </template>

    <el-empty v-else-if="!articles.length" description="该标签下暂无文章" />

    <template v-else>
      <article v-for="article in articles" :key="article.id" class="post-card">
        <div class="post-title">
          <router-link :to="`/posts/${article.slug}`">{{ article.title }}</router-link>
        </div>
        <div class="post-meta">
          <span>{{ formatDate(article.created_at) }}</span>
          <el-tag v-if="article.category" size="small" type="info">
            {{ article.category.name }}
          </el-tag>
        </div>
        <p class="post-summary">{{ extractSummary(article.content_md) }}</p>
      </article>

      <Pagination :total="total" :current-page="currentPage" @page-change="fetchArticles" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getTagArticles } from '../api/tags.js'
import Pagination from '../components/Pagination.vue'

const route = useRoute()
const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const loading = ref(false)
const tagName = ref('')

async function fetchArticles(page = 1) {
  loading.value = true
  try {
    const res = await getTagArticles(route.params.slug, page, 10)
    articles.value = res.data.articles || []
    total.value = res.data.total || 0
    tagName.value = res.data.tag?.name || ''
    currentPage.value = page
  } catch {
    articles.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(d) { return d ? d.slice(0, 10) : '' }

function extractSummary(md) {
  if (!md) return ''
  const plain = md
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`~>]+/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return plain.length > 200 ? plain.slice(0, 200) + '…' : plain
}

onMounted(() => fetchArticles(1))
watch(() => route.params.slug, () => fetchArticles(1))
</script>
