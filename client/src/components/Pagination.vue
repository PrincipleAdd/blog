<template>
  <div style="display: flex; justify-content: center; margin-top: 24px;">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      background
      @current-change="(page) => $emit('page-change', page)"
    />
  </div>
</template>

<script setup>
defineProps({
  total: { type: Number, required: true },
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, default: 10 }
})
defineEmits(['page-change'])
</script>
