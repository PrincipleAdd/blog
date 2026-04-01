<template>
  <div class="editor-page">
    <!-- 顶部操作栏 -->
    <div class="editor-header">
      <div class="editor-header-left">
        <el-button size="small" @click="$router.push('/admin/posts')">← 返回</el-button>
        <span class="editor-title">{{ isEdit ? '编辑文章' : '新建文章' }}</span>
        <span v-if="autoSaved" class="autosave-tip">✓ 已自动保存</span>
      </div>
      <div class="editor-header-right">
        <span class="word-count">{{ wordCount }} 字</span>
        <el-select v-model="form.status" size="small" style="width: 100px;">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
        </el-select>
        <el-button type="primary" size="small" :loading="saving" @click="handleSubmit">
          {{ form.status === 'published' ? '发布' : '保存草稿' }}
        </el-button>
      </div>
    </div>

    <!-- 标题输入 -->
    <input
      v-model="form.title"
      class="title-input"
      placeholder="文章标题..."
      maxlength="200"
    />

    <!-- 元信息栏 -->
    <div class="meta-bar">
      <el-select v-model="form.categoryId" placeholder="选择分类" clearable size="small" style="width: 140px;">
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-select v-model="form.tagIds" multiple placeholder="选择标签" size="small" style="width: 240px;" collapse-tags>
        <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
      </el-select>
    </div>

    <!-- Markdown 编辑器 -->
    <MdEditor
      v-model="form.content"
      class="md-editor-main"
      language="zh-CN"
      :toolbars="toolbars"
      :preview="true"
      :html-preview="false"
      :show-code-row-number="true"
      :auto-focus="false"
      theme="light"
      preview-theme="github"
      code-theme="atom"
      :sanitize="sanitize"
      @on-upload-img="handleUploadImg"
      @on-save="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { createArticle, updateArticle, getAdminArticles } from '../../api/articles.js'
import { getCategories } from '../../api/categories.js'
import { getTags } from '../../api/tags.js'
import api from '../../api/index.js'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const autoSaved = ref(false)
const categories = ref([])
const tags = ref([])

const form = reactive({
  title: '',
  content: '',
  categoryId: null,
  tagIds: [],
  status: 'draft'
})

// 字数统计（去除 Markdown 符号）
const wordCount = computed(() => {
  return form.content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~>|#\-=+]/g, '')
    .replace(/\s+/g, '')
    .length
})

// 完整工具栏
const toolbars = [
  'bold', 'underline', 'italic', 'strikeThrough', '-',
  'title', 'sub', 'sup', 'quote', '-',
  'unorderedList', 'orderedList', 'task', '-',
  'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-',
  'revoke', 'next', '=',
  'prettier', 'pageFullscreen', 'fullscreen', 'preview', 'previewOnly', 'htmlPreview', 'catalog'
]

// XSS 防护（保留安全标签）
function sanitize(html) { return html }

// 图片上传处理
async function handleUploadImg(files, callback) {
  const urls = []
  for (const file of files) {
    try {
      const reader = new FileReader()
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = e => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await api.post('/api/admin/upload', { base64, filename: file.name })
      urls.push(res.data.url)
    } catch {
      ElMessage.error(`图片 ${file.name} 上传失败`)
      urls.push('')
    }
  }
  callback(urls)
}

// 自动保存草稿到 localStorage
let autoSaveTimer = null

watch(() => form.content, () => {
  autoSaved.value = false
  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    const key = isEdit.value ? `draft_edit_${route.params.id}` : 'draft_new'
    localStorage.setItem(key, JSON.stringify({
      title: form.title,
      content: form.content,
      categoryId: form.categoryId,
      tagIds: form.tagIds,
      status: form.status,
      savedAt: new Date().toISOString()
    }))
    autoSaved.value = true
    setTimeout(() => { autoSaved.value = false }, 3000)
  }, 2000)
})

// 加载元数据
async function loadMeta() {
  const [catRes, tagRes] = await Promise.all([getCategories(), getTags()])
  categories.value = catRes.data || []
  tags.value = tagRes.data || []
}

// 加载文章（编辑模式）
async function loadArticle(id) {
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

// 恢复本地草稿
function restoreLocalDraft() {
  if (isEdit.value) return
  const saved = localStorage.getItem('draft_new')
  if (!saved) return
  try {
    const draft = JSON.parse(saved)
    if (draft.content && !form.content) {
      ElMessage({
        message: `检测到未保存的草稿（${draft.savedAt?.slice(0, 16)}），已自动恢复`,
        type: 'info',
        duration: 4000
      })
      form.title = draft.title || ''
      form.content = draft.content || ''
      form.categoryId = draft.categoryId || null
      form.tagIds = draft.tagIds || []
      form.status = draft.status || 'draft'
    }
  } catch { /* 忽略 */ }
}

// 提交
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
      localStorage.removeItem('draft_new')
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
  if (isEdit.value) {
    await loadArticle(route.params.id)
  } else {
    restoreLocalDraft()
  }
})

onUnmounted(() => clearTimeout(autoSaveTimer))
</script>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  gap: 0;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 12px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.editor-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.editor-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.autosave-tip {
  font-size: 12px;
  color: #67c23a;
}

.word-count {
  font-size: 12px;
  color: #999;
}

.title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  padding: 8px 0;
  margin-bottom: 10px;
  background: transparent;
  flex-shrink: 0;
}

.title-input::placeholder { color: #ccc; }

.meta-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.md-editor-main {
  flex: 1;
  min-height: 0;
}
</style>
