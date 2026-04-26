<template>
  <main class="min-h-screen bg-background pb-mobile-bottom-nav">
    <header class="relative overflow-hidden rounded-b-2xl bg-primary px-margin-page pb-12 pt-14 text-on-primary shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div class="absolute right-0 top-0 translate-x-1/3 -translate-y-1/4 opacity-10">
        <div class="h-[200px] w-[200px] rounded-full bg-white" />
      </div>
      <div class="pointer-events-none absolute left-0 top-4 w-full text-center">
        <span class="text-headline-sm">我的</span>
      </div>
      <button type="button" class="relative z-10 flex w-full items-center gap-4 text-left">
        <div class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary-fixed bg-surface-variant shadow-inner">
          <span class="material-symbols-outlined text-[32px] text-outline">person</span>
        </div>
        <div>
          <h1 class="text-headline-md text-on-primary">点击登录 / 注册</h1>
          <p class="text-body-md text-primary-fixed-dim">登录后查看更多相关服务</p>
        </div>
        <span class="material-symbols-outlined ml-auto text-primary-fixed">chevron_right</span>
      </button>
    </header>

    <section class="-mt-6 relative z-20 grid grid-cols-2 gap-gutter-grid px-margin-page">
      <RouterLink
        to="/customer/records"
        class="flex flex-col items-center justify-center gap-3 rounded-xl border border-surface-variant bg-surface-container-lowest p-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed/20 text-primary">
          <span class="material-symbols-outlined icon-fill">history_edu</span>
        </div>
        <p class="text-label-md text-on-surface">我的记录</p>
      </RouterLink>

      <RouterLink
        to="/customer/progress/order-demo-001"
        class="flex flex-col items-center justify-center gap-3 rounded-xl border border-surface-variant bg-surface-container-lowest p-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed/30 text-secondary">
          <span class="material-symbols-outlined icon-fill">pending_actions</span>
        </div>
        <p class="text-label-md text-on-surface">报废进度</p>
      </RouterLink>
    </section>

    <section class="px-margin-page pt-stack-lg">
      <div class="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <RouterLink
          v-for="(item, index) in supportItems"
          :key="item.to"
          :to="item.to"
          class="group relative flex items-center justify-between p-inset-card transition-colors active:bg-surface-container"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-outline">{{ item.icon }}</span>
            <span class="text-body-md text-on-surface">{{ item.label }}</span>
          </div>
          <span class="material-symbols-outlined text-outline-variant transition-transform group-active:translate-x-1">chevron_right</span>
          <div v-if="index < supportItems.length - 1" class="absolute bottom-0 left-4 right-4 h-px bg-surface-variant" />
        </RouterLink>
      </div>
    </section>

    <footer class="px-margin-page pb-4 pt-8 text-center">
      <p class="text-[11px] text-outline-variant">© {{ currentYear }} 车辆报废回收平台</p>
      <p class="mt-1 flex items-center justify-center gap-1 text-[11px] text-outline-variant">
        <span class="material-symbols-outlined text-[14px]">shield</span>
        保障您的信息安全与合法合规
      </p>
    </footer>

    <MobileBottomNav />
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";

const supportItems = [
  { to: "/customer/guide", label: "常见问题", icon: "help" },
  { to: "/customer/support", label: "联系客服", icon: "support_agent" },
];

const currentYear = new Date().getFullYear();
</script>
