<template>
  <div class="markdown-body" v-html="content" />
</template>

<script setup>
import 'highlight.js/styles/github-dark.css'

defineProps({
  content: { type: String, default: '' }
})
</script>

<style scoped>
.markdown-body {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin: 24px 0 12px;
  font-weight: 600;
  color: #222;
}
.markdown-body :deep(p) { margin-bottom: 16px; }
.markdown-body :deep(a) { color: #409eff; text-decoration: none; }
.markdown-body :deep(a:hover) { text-decoration: underline; }
.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding: 8px 16px;
  margin: 16px 0;
  background: #f8f9fa;
  color: #666;
}
.markdown-body :deep(pre) {
  background: #282c34;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}
.markdown-body :deep(code) {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
}
.markdown-body :deep(p code) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  color: #e83e8c;
}
.markdown-body :deep(img) { max-width: 100%; border-radius: 4px; }
.markdown-body :deep(ul),
.markdown-body :deep(ol) { padding-left: 24px; margin-bottom: 16px; }
.markdown-body :deep(li) { margin-bottom: 4px; }
.markdown-body :deep(table) { width: 100%; border-collapse: collapse; margin: 16px 0; }
.markdown-body :deep(th),
.markdown-body :deep(td) { border: 1px solid #e8e8e8; padding: 8px 12px; }
.markdown-body :deep(th) { background: #f5f5f5; font-weight: 600; }
</style>
