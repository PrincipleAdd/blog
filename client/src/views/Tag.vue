<template>
  <div>
    <h1 class="page__title">{{ tagName || route.params.slug }}</h1>

    <template v-if="loading">
      <div v-for="i in 3" :key="i" style="padding: 18px 0; border-bottom: 1px solid var(--border);">
        <el-skeleton :rows="2" animated />
      </div>
    </template>

    <div v-else-if="!articles.length" class="empty-state">该标签下暂无文章</div>

    <ul v-else class="archive__item-list">
      <li v-for="article in articles" :key="article.id" class="archive__item">
        <div class="page__meta">
          <span>{{ article.created_at?.slice(0,10) }}</span>
          <span v-if="article.category" class="page__meta-sep">·</span>
          <router-link v-if="article.category" :to="`/categories/${article.category.slug}`">
            {{ article.category.name }}
          </router-link>
        </div>
        <h2 class="archive__item-title">
          <router-link :to="`/posts/${article.slug}`">{{ article.title }}</router-link>
        </h2>
        <p class="archive__item-excerpt">{{ extractSummary(article.content_md) }}</p>
      </li>
    </ul>

    <div v-if="total > 10" class="pagination-wrap">
      <el-pagination v-model:current-page="currentPage" :page-size="10" :total="total"
        layout="prev, pager, next" background @current-change="fetchArticles" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getTagArticles } from '../api/tags.js'

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
  } catch { articles.value = [] } finally { loading.value = false }
}

function extractSummary(md) {
  if (!md) return ''
  return md.replace(/!\[.*?\]\(.*?\)/g,'').replace(/\[([^\]]+)\]\(.*?\)/g,'$1')
    .replace(/#{1,6}\s+/g,'').replace(/[*_`~>]+/g,'').replace(/\n+/g,' ').trim().slice(0,160)
}

onMounted(() => fetchArticles(1))
watch(() => route.params.slug, () => fetchArticles(1))
</script>
