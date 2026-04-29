<template>
  <button
    type="button"
    class="mobile-back-button inline-flex h-11 w-11 select-none items-center justify-center rounded-full text-on-surface transition-colors active:bg-surface-container-high"
    aria-label="返回上一页"
    @click="emit('click')"
  >
    <span aria-hidden="true" class="mobile-back-button__chevron" />
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  click: [];
}>();
</script>

<style scoped>
.mobile-back-button__chevron {
  width: 12px;
  height: 12px;
  border-left: 2.5px solid currentColor;
  border-bottom: 2.5px solid currentColor;
  transform: translateX(2px) rotate(45deg);
}
</style>
