<template>
  <div class="public-main">
    <!-- 骨架屏 -->
    <template v-if="loading">
      <el-skeleton :rows="8" animated style="background:#fff;border-radius:8px;padding:32px;" />
    </template>

    <!-- 404 提示 -->
    <el-empty v-else-if="notFound" description="文章不存在或已被删除">
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </el-empty>

    <!-- 文章内容 -->
    <article v-else-if="article" class="post-detail">
      <header class="post-header">
        <h1 class="post-title">{{ article.title }}</h1>
        <div class="post-meta">
          <span class="post-date">{{ formatDate(article.created_at) }}</span>
          <router-link
            v-if="article.category"
            :to="`/categories/${article.category.slug}`"
            class="post-category-link"
          >
            <el-tag type="info" size="small">{{ article.category.name }}</el-tag>
          </router-link>
          <router-link
            v-for="tag in article.tags"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
            class="post-tag-link"
          >
            <el-tag size="small" effect="plain">{{ tag.name }}</el-tag>
          </router-link>
        </div>
      </header>

      <div class="post-content" v-html="article.content_html" />
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { getArticle } from '../api/articles.js'

const route = useRoute()
const router = useRouter()

const article = ref(null)
const loading = ref(false)
const notFound = ref(false)

// 动态 head
const title = ref('加载中 | 我的博客')
const description = ref('')
const ogTitle = ref('')
const ogDescription = ref('')

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: ogTitle },
    { property: 'og:description', content: ogDescription },
    { property: 'og:type', content: 'article' }
  ]
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

function extractDescription(md) {
  if (!md) return ''
  const plain = md
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`~>]+/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return plain.slice(0, 150)
}

async function fetchArticle(slug) {
  loading.value = true
  notFound.value = false
  article.value = null
  try {
    const res = await getArticle(slug)
    article.value = res.data
    const desc = extractDescription(article.value.content_md)
    title.value = `${article.value.title} | 我的博客`
    description.value = desc
    ogTitle.value = article.value.title
    ogDescription.value = desc
  } catch (e) {
    if (e.response?.status === 404) {
      notFound.value = true
    } else {
      notFound.value = true
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchArticle(route.params.slug))

watch(() => route.params.slug, (slug) => {
  if (slug) fetchArticle(slug)
})
</script>

<style scoped>
.post-detail {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.post-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.post-title {
  font-size: 28px;
  font-weight: 700;
  color: #222;
  line-height: 1.4;
  margin-bottom: 12px;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #999;
}

.post-date {
  margin-right: 4px;
}

.post-category-link,
.post-tag-link {
  text-decoration: none;
}

.post-category-link:hover :deep(.el-tag),
.post-tag-link:hover :deep(.el-tag) {
  opacity: 0.8;
}

/* 文章正文排版 */
.post-content {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3),
.post-content :deep(h4),
.post-content :deep(h5),
.post-content :deep(h6) {
  margin: 24px 0 12px;
  font-weight: 600;
  color: #222;
}

.post-content :deep(h1) { font-size: 24px; }
.post-content :deep(h2) { font-size: 20px; }
.post-content :deep(h3) { font-size: 18px; }

.post-content :deep(p) {
  margin-bottom: 16px;
}

.post-content :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.post-content :deep(a:hover) {
  text-decoration: underline;
}

.post-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding: 8px 16px;
  margin: 16px 0;
  background: #f8f9fa;
  color: #666;
}

.post-content :deep(pre) {
  background: #282c34;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.post-content :deep(code) {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
}

.post-content :deep(p code) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  color: #e83e8c;
  font-size: 14px;
}

.post-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.post-content :deep(li) {
  margin-bottom: 4px;
}

.post-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.post-content :deep(th),
.post-content :deep(td) {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  text-align: left;
}

.post-content :deep(th) {
  background: #f5f5f5;
  font-weight: 600;
}

@media (max-width: 768px) {
  .post-detail {
    padding: 20px 16px;
  }

  .post-title {
    font-size: 22px;
  }

  .post-content {
    font-size: 15px;
  }
}
</style>
