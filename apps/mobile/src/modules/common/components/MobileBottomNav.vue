<template>
  <nav class="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-variant bg-white/95 backdrop-blur md:hidden">
    <div class="mx-auto flex h-16 max-w-md items-center justify-around px-4 pb-safe">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-1 text-[11px] font-medium"
        :class="route.path === item.to ? 'text-primary' : 'text-on-surface-variant'"
      >
        <span class="text-lg">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const items = computed(() => [
  { to: "/customer", label: "首页", icon: "⌂" },
  { to: "/customer/valuation", label: "估价", icon: "◈" },
  { to: "/customer/me", label: "我的", icon: "◉" },
]);
</script>
