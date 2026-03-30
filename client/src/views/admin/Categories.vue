<template>
  <div>
    <h2 style="margin-bottom: 20px; color: #222;">分类管理</h2>

    <!-- 新建分类 -->
    <el-card style="margin-bottom: 20px;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <el-input
          v-model="newName"
          placeholder="输入分类名称"
          style="max-width: 300px;"
          @keyup.enter="handleCreate"
        />
        <el-button type="primary" :loading="creating" @click="handleCreate">添加分类</el-button>
      </div>
    </el-card>

    <!-- 分类列表 -->
    <el-table :data="categories" v-loading="loading" border stripe>
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="slug" label="Slug" />
      <el-table-column label="创建时间" width="130">
        <template #default="{ row }">{{ row.created_at?.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategories, createCategory, deleteCategory } from '../../api/categories.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const categories = ref([])
const loading = ref(false)
const creating = ref(false)
const newName = ref('')

async function fetchCategories() {
  loading.value = true
  try {
    const res = await getCategories()
    categories.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!newName.value.trim()) { ElMessage.warning('请输入分类名称'); return }
  creating.value = true
  try {
    await createCategory(newName.value.trim())
    ElMessage.success('分类已创建')
    newName.value = ''
    fetchCategories()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '创建失败')
  } finally {
    creating.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '确认删除', { type: 'warning' })
  try {
    await deleteCategory(row.id)
    ElMessage.success('已删除')
    fetchCategories()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(fetchCategories)
</script>
