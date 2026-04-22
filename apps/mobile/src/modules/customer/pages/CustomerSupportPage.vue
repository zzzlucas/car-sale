<template>
  <main class="min-h-screen bg-background">
    <header class="flex h-14 items-center justify-between border-b border-[#ececec] bg-[#f8faf9] px-5">
      <RouterLink to="/customer/me" class="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-outline transition-colors active:bg-surface-container">
        <span class="material-symbols-outlined">arrow_back</span>
      </RouterLink>
      <div class="flex-1 text-center">
        <h1 class="text-lg font-semibold tracking-tight text-primary">Vehicle Recycling</h1>
      </div>
      <div class="w-10" />
    </header>

    <main class="mx-auto flex max-w-md flex-col space-y-stack-lg px-margin-page pb-24 pt-stack-md">
      <section class="flex flex-col items-center pb-4 pt-8 text-center">
        <div class="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-primary-container shadow-sm">
          <div class="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_40%_30%,#4bb6d0_0,#4bb6d0_28%,#2e91a8_29%,#2e91a8_100%)]">
            <span class="material-symbols-outlined icon-fill text-[44px] text-white">support_agent</span>
          </div>
        </div>
        <h2 class="mb-2 text-[2rem] font-semibold leading-tight text-on-surface">您好，今天您的爱车需要什么帮助？</h2>
        <p class="text-body-md text-on-surface-variant">{{ support?.intro || "专业车辆报废回收平台，为您提供便捷服务。" }}</p>
      </section>

      <section class="grid grid-cols-3 gap-gutter-grid">
        <RouterLink
          v-for="item in quickOptions"
          :key="item.to"
          :to="item.to"
          class="group flex flex-col items-center justify-center rounded-xl border border-surface-variant bg-surface-container-lowest p-4 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] transition-colors active:bg-surface-container-low"
        >
          <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-primary transition-transform group-active:scale-95">
            <span class="material-symbols-outlined text-2xl">{{ item.icon }}</span>
          </div>
          <span class="text-label-md text-on-surface">{{ item.label }}</span>
        </RouterLink>
      </section>

      <section class="mt-4">
        <a
          :href="`tel:${support?.phone || defaultPhone}`"
          class="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-headline-sm text-on-primary shadow-sm transition-colors active:bg-surface-tint"
        >
          <span class="material-symbols-outlined mr-2">chat_bubble</span>
          开始在线咨询
        </a>

        <div class="mt-6 flex items-start rounded-lg bg-surface-container-low p-4">
          <span class="material-symbols-outlined mr-3 mt-0.5 text-outline">schedule</span>
          <div>
            <h3 class="mb-1 text-label-md text-on-surface">服务时间</h3>
            <p class="text-body-md text-on-surface-variant">{{ support?.serviceHours || "周一至周日 08:30 - 18:00" }}</p>
            <p class="mt-1 text-xs text-outline">非工作时间请留言，我们将于下一个工作日尽快回复您。</p>
          </div>
        </div>
      </section>
    </main>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import type { SupportContent } from "@car/shared-types";
import { getSupport } from "@/services/content";

const support = ref<SupportContent | null>(null);
const defaultPhone = "400-800-8899";

const quickOptions = [
  { to: "/customer/progress/order-demo-001", label: "进度查询", icon: "manage_search" },
  { to: "/customer/valuation", label: "价格咨询", icon: "currency_yuan" },
  { to: "/customer/guide", label: "材料准备", icon: "inventory_2" },
];

onMounted(async () => {
  support.value = await getSupport();
});
</script>
