<template>
  <div>
    <div style="display: flex; align-items: center; margin-bottom: 24px; gap: 12px;">
      <el-button @click="$router.push('/admin/posts')">← 返回</el-button>
      <h2 style="margin: 0; color: #222;">{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
    </div>

    <el-form :model="form" label-position="top">
      <!-- 标题 -->
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="请输入文章标题" size="large" />
      </el-form-item>

      <!-- 分类 & 标签 & 状态 -->
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="分类">
            <el-select v-model="form.categoryId" placeholder="选择分类" clearable style="width: 100%;">
              <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="标签">
            <el-select v-model="form.tagIds" multiple placeholder="选择标签" style="width: 100%;">
              <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态">
            <el-select v-model="form.status" style="width: 100%;">
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Markdown 编辑器 -->
      <el-form-item label="内容" required>
        <MdEditor
          v-model="form.content"
          style="width: 100%;"
          :preview="true"
          language="zh-CN"
          :toolbars="toolbars"
        />
      </el-form-item>

      <!-- 提交 -->
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ form.status === 'published' ? '发布文章' : '保存草稿' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { createArticle, updateArticle, getAdminArticles } from '../../api/articles.js'
import { getCategories } from '../../api/categories.js'
import { getTags } from '../../api/tags.js'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const categories = ref([])
const tags = ref([])

const form = reactive({
  title: '',
  content: '',
  categoryId: null,
  tagIds: [],
  status: 'draft'
})

const toolbars = [
  'bold', 'underline', 'italic', '-',
  'title', 'strikeThrough', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-',
  'codeRow', 'code', 'link', 'image', 'table', '-',
  'revoke', 'next', '=',
  'preview', 'fullscreen'
]

async function loadMeta() {
  const [catRes, tagRes] = await Promise.all([getCategories(), getTags()])
  categories.value = catRes.data || []
  tags.value = tagRes.data || []
}

async function loadArticle(id) {
  // 从管理列表中找到对应文章（通过遍历分页获取）
  const res = await getAdminArticles(1, 9999)
  const article = (res.data.articles || []).find(a => a.id === Number(id))
  if (article) {
    form.title = article.title
    form.content = article.content_md
    form.categoryId = article.category_id || null
    form.tagIds = (article.tags || []).map(t => t.id)
    form.status = article.status
  }
}

async function handleSubmit() {
  if (!form.title.trim()) { ElMessage.warning('请输入文章标题'); return }
  if (!form.content.trim()) { ElMessage.warning('请输入文章内容'); return }
  saving.value = true
  try {
    const payload = {
      title: form.title,
      content: form.content,
      categoryId: form.categoryId || null,
      tagIds: form.tagIds,
      status: form.status
    }
    if (isEdit.value) {
      await updateArticle(route.params.id, payload)
      ElMessage.success('文章已更新')
    } else {
      await createArticle(payload)
      ElMessage.success('文章已创建')
    }
    router.push('/admin/posts')
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadMeta()
  if (isEdit.value) await loadArticle(route.params.id)
})
</script>
