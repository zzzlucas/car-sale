<template>
  <nav class="glass-panel fixed bottom-0 left-0 right-0 z-30 rounded-t-[1.75rem] border-t border-white/50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] md:hidden">
    <div class="mx-auto flex h-[84px] max-w-md items-center justify-around px-6 pb-safe pt-3">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex w-16 flex-col items-center justify-center transition-transform active:scale-95"
        :class="isActive(item) ? 'scale-105 font-bold text-primary' : 'text-outline'"
      >
        <div class="relative mb-1">
          <span class="material-symbols-outlined text-2xl" :class="isActive(item) ? 'icon-fill' : ''">{{ item.icon }}</span>
          <div v-if="isActive(item)" class="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-secondary-container" />
        </div>
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const items = computed(() => [
  { to: "/customer", label: "Home", icon: "home", match: "/customer" },
  { to: "/customer/valuation", label: "Scrap", icon: "recycling", match: "/customer/valuation" },
  { to: "/customer/progress/order-demo-001", label: "Records", icon: "assignment", match: "/customer/progress" },
  { to: "/customer/me", label: "Me", icon: "person", match: "/customer/me" },
]);

function isActive(item: { to: string; match: string }) {
  return route.path === item.to || route.path.startsWith(item.match);
}
</script>
