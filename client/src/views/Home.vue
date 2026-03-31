<template>
  <div>
    <!-- 骨架屏 -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" style="padding: 20px 0; border-bottom: 1px solid var(--border);">
        <el-skeleton :rows="3" animated />
      </div>
    </template>

    <!-- 空状态 -->
    <div v-else-if="!articles.length" class="empty-state">
      <div style="font-size: 32px; margin-bottom: 10px;">📭</div>
      暂无文章
    </div>

    <!-- 文章列表 -->
    <ul v-else class="archive__item-list">
      <li v-for="article in articles" :key="article.id" class="archive__item">
        <div class="page__meta">
          <span>{{ formatDate(article.created_at) }}</span>
          <span v-if="article.category" class="page__meta-sep">·</span>
          <router-link v-if="article.category" :to="`/categories/${article.category.slug}`">
            {{ article.category.name }}
          </router-link>
        </div>
        <h2 class="archive__item-title">
          <router-link :to="`/posts/${article.slug}`">{{ article.title }}</router-link>
        </h2>
        <p class="archive__item-excerpt">{{ extractSummary(article.content_md) }}</p>
        <div v-if="article.tags?.length" class="archive__item-tags">
          <router-link
            v-for="tag in article.tags"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
            class="archive__item-tag"
          >{{ tag.name }}</router-link>
        </div>
      </li>
    </ul>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination-wrap">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="fetchArticles"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArticles } from '../api/articles.js'

const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)

async function fetchArticles(page = 1) {
  loading.value = true
  try {
    const res = await getArticles(page, pageSize)
    articles.value = res.data.articles || []
    total.value = res.data.total || 0
    currentPage.value = page
  } catch { articles.value = [] } finally { loading.value = false }
}

function extractSummary(md) {
  if (!md) return ''
  return md
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`~>]+/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 160)
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

onMounted(() => fetchArticles(1))
</script>
