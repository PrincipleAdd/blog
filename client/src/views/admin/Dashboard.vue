<template>
  <div>
    <h2 style="margin-bottom: 24px; color: #222;">控制台</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 32px;">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ stats.articles }}</div>
          <div class="stat-label">文章总数</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ stats.categories }}</div>
          <div class="stat-label">分类总数</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ stats.tags }}</div>
          <div class="stat-label">标签总数</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <h3 style="margin-bottom: 16px; color: #444;">快捷操作</h3>
    <el-row :gutter="16">
      <el-col :xs="24" :sm="8">
        <el-button type="primary" size="large" style="width: 100%;" @click="$router.push('/admin/posts/new')">
          ✏️ 新建文章
        </el-button>
      </el-col>
      <el-col :xs="24" :sm="8" style="margin-top: 8px;">
        <el-button size="large" style="width: 100%;" @click="$router.push('/admin/categories')">
          📁 管理分类
        </el-button>
      </el-col>
      <el-col :xs="24" :sm="8" style="margin-top: 8px;">
        <el-button size="large" style="width: 100%;" @click="$router.push('/admin/tags')">
          🏷️ 管理标签
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getAdminArticles } from '../../api/articles.js'
import { getCategories } from '../../api/categories.js'
import { getTags } from '../../api/tags.js'

const stats = reactive({ articles: 0, categories: 0, tags: 0 })

onMounted(async () => {
  try {
    const [artRes, catRes, tagRes] = await Promise.all([
      getAdminArticles(1, 1),
      getCategories(),
      getTags()
    ])
    stats.articles = artRes.data.total || 0
    stats.categories = (catRes.data || []).length
    stats.tags = (tagRes.data || []).length
  } catch { /* 静默失败 */ }
})
</script>

<style scoped>
.stat-card { text-align: center; padding: 8px 0; }
.stat-number { font-size: 36px; font-weight: 700; color: #409eff; }
.stat-label { font-size: 14px; color: #888; margin-top: 4px; }
</style>
