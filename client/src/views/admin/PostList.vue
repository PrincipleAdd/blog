<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #222;">文章管理</h2>
      <el-button type="primary" @click="$router.push('/admin/posts/new')">+ 新建文章</el-button>
    </div>

    <el-table :data="articles" v-loading="loading" border stripe style="width: 100%;">
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <router-link :to="`/posts/${row.slug}`" target="_blank" style="color: #409eff; text-decoration: none;">
            {{ row.title }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120">
        <template #default="{ row }">{{ row.category?.name || '—' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="120">
        <template #default="{ row }">{{ row.created_at?.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="$router.push(`/admin/posts/${row.id}/edit`)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: center; margin-top: 20px;">
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
import { getAdminArticles, deleteArticle } from '../../api/articles.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 15
const loading = ref(false)

async function fetchArticles(page = 1) {
  loading.value = true
  try {
    const res = await getAdminArticles(page, pageSize)
    articles.value = res.data.articles || []
    total.value = res.data.total || 0
    currentPage.value = page
  } finally {
    loading.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除文章「${row.title}」吗？`, '确认删除', {
    type: 'warning',
    confirmButtonText: '删除',
    confirmButtonClass: 'el-button--danger'
  })
  try {
    await deleteArticle(row.id)
    ElMessage.success('已删除')
    fetchArticles(currentPage.value)
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(() => fetchArticles(1))
</script>
