<template>
  <div class="public-main">
    <!-- 骨架屏 -->
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="post-card">
        <el-skeleton :rows="4" animated />
      </div>
    </template>

    <!-- 空状态 -->
    <el-empty v-else-if="!articles.length" description="暂无文章" />

    <!-- 文章列表 -->
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
          <el-tag
            v-for="tag in article.tags"
            :key="tag.id"
            size="small"
            effect="plain"
          >{{ tag.name }}</el-tag>
        </div>
        <p class="post-summary">{{ extractSummary(article.content_md) }}</p>
      </article>

      <!-- 分页 -->
      <div style="display: flex; justify-content: center; margin-top: 24px;">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="fetchArticles"
        />
      </div>
    </template>
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
  } catch (e) {
    articles.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 去除 Markdown 符号，截取前 200 字符
function extractSummary(md) {
  if (!md) return ''
  const plain = md
    .replace(/!\[.*?\]\(.*?\)/g, '')   // 图片
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // 链接
    .replace(/#{1,6}\s+/g, '')          // 标题
    .replace(/[*_`~>]+/g, '')           // 强调、代码、引用
    .replace(/\n+/g, ' ')               // 换行
    .trim()
  return plain.length > 200 ? plain.slice(0, 200) + '…' : plain
}

// 格式化日期为 YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

onMounted(() => fetchArticles(1))
</script>
