<template>
  <div>
    <template v-if="loading">
      <el-skeleton :rows="10" animated />
    </template>

    <div v-else-if="notFound" class="empty-state">
      <div style="font-size: 36px; margin-bottom: 10px;">🔍</div>
      <div style="margin-bottom: 14px;">文章不存在或已被删除</div>
      <router-link to="/">← 返回首页</router-link>
    </div>

    <article v-else-if="article">
      <header class="page__header">
        <h1 class="page__post-title">{{ article.title }}</h1>
        <div class="page__post-meta">
          <span>{{ formatDate(article.created_at) }}</span>
          <span v-if="article.category_name">·</span>
          <router-link v-if="article.category_name" :to="`/categories/${article.category_slug}`">
            {{ article.category_name }}
          </router-link>
          <template v-if="article.tags?.length">
            <span>·</span>
            <router-link
              v-for="tag in article.tags"
              :key="tag.id"
              :to="`/tags/${tag.slug}`"
            >{{ tag.name }}</router-link>
          </template>
        </div>
      </header>

      <div class="page__content" v-html="article.content_html" />

      <div class="page__back">
        <router-link to="/">← 返回文章列表</router-link>
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

const title = ref('Principle')
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
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

function extractDesc(md) {
  if (!md) return ''
  return md.replace(/!\[.*?\]\(.*?\)/g,'').replace(/\[([^\]]+)\]\(.*?\)/g,'$1')
    .replace(/#{1,6}\s+/g,'').replace(/[*_`~>]+/g,'').replace(/\n+/g,' ').trim().slice(0,150)
}

async function fetchArticle(slug) {
  loading.value = true
  notFound.value = false
  article.value = null
  try {
    const res = await getArticle(slug)
    article.value = res.data
    title.value = `${res.data.title} | Principle`
    description.value = extractDesc(res.data.content_md)
  } catch { notFound.value = true } finally { loading.value = false }
}

onMounted(() => fetchArticle(route.params.slug))
watch(() => route.params.slug, slug => { if (slug) fetchArticle(slug) })
</script>
