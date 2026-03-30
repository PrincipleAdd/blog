<template>
  <div class="tag-cloud">
    <router-link
      v-for="tag in tags"
      :key="tag.id"
      :to="`/tags/${tag.slug}`"
      class="tag-cloud-item"
      :style="{ fontSize: calcFontSize(tag.article_count) + 'px' }"
    >
      {{ tag.name }}
    </router-link>
    <el-empty v-if="!tags.length && !loading" description="暂无标签" :image-size="60" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTags } from '../api/tags.js'

const tags = ref([])
const loading = ref(false)

const MIN_SIZE = 12
const MAX_SIZE = 24

function calcFontSize(count) {
  if (!tags.value.length) return MIN_SIZE
  const counts = tags.value.map(t => t.article_count || 0)
  const max = Math.max(...counts) || 1
  const min = Math.min(...counts)
  if (max === min) return (MIN_SIZE + MAX_SIZE) / 2
  return Math.round(MIN_SIZE + ((count - min) / (max - min)) * (MAX_SIZE - MIN_SIZE))
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getTags()
    tags.value = res.data || []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 0;
}
.tag-cloud-item {
  color: #555;
  text-decoration: none;
  transition: color 0.2s;
  line-height: 1.4;
}
.tag-cloud-item:hover {
  color: #409eff;
}
</style>
