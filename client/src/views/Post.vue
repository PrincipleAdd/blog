<template>
  <div>
    <!-- 骨架屏 -->
    <template v-if="loading">
      <el-skeleton :rows="10" animated />
    </template>

    <!-- 404 -->
    <div v-else-if="notFound" class="empty-state">
      <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
      <div style="margin-bottom: 16px;">文章不存在或已被删除</div>
      <router-link to="/" style="color: var(--accent); font-size: 14px;">← 返回首页</router-link>
    </div>

    <!-- 文章 -->
    <article v-else-if="article">
      <header class="post-detail-header">
        <h1 class="post-detail-title">{{ article.title }}</h1>
        <div class="post-detail-meta">
          <span>{{ formatDate(article.created_at) }}</span>
          <router-link v-if="article.category" :to="`/categories/${article.category.slug}`">
            📁 {{ article.category.name }}
          </router-link>
          <router-link
            v-for="tag in article.tags"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
          ># {{ tag.name }}</router-link>
        </div>
      </header>

      <div class="prose" v-html="article.content_html" />

      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border);">
        <router-link to="/" style="font-size: 14px; color: var(--text-secondary);">← 返回文章列表</router-link>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { getArticle } from '../api/articles.js'

const route = useRoute()
const article = ref(null)
const loading = ref(false)
const notFound = ref(false)

const title = ref('我的博客')
const description = ref('')

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'article' }
  ]
})

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

function extractDesc(md) {
  if (!md) return ''
  return md.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '').replace(/[*_`~>]+/g, '').replace(/\n+/g, ' ').trim().slice(0, 150)
}

async function fetchArticle(slug) {
  loading.value = true
  notFound.value = false
  article.value = null
  try {
    const res = await getArticle(slug)
    article.value = res.data
    title.value = `${res.data.title} | 我的博客`
    description.value = extractDesc(res.data.content_md)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchArticle(route.params.slug))
watch(() => route.params.slug, slug => { if (slug) fetchArticle(slug) })
</script>
