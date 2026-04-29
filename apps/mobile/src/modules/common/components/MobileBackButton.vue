<template>
  <button
    type="button"
    class="mobile-back-button inline-flex h-10 min-w-[4.75rem] select-none items-center justify-center gap-0.5 rounded-full border border-outline-variant bg-white/90 pl-2 pr-3 text-label-md font-semibold text-primary shadow-subtle backdrop-blur transition active:scale-[0.98] active:bg-surface-container"
    aria-label="返回上一页"
    @click="emit('click')"
  >
    <span class="material-symbols-outlined text-[22px]">chevron_left</span>
    <span>返回</span>
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  click: [];
}>();
</script>
