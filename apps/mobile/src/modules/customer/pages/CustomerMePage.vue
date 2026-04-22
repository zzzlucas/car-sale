<template>
  <main class="min-h-screen bg-background pb-24 pt-safe">
    <section class="relative overflow-hidden bg-primary px-margin-page pb-10 pt-stack-lg text-on-primary">
      <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div class="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white/5 blur-xl" />

      <div class="relative z-10 flex items-center gap-4">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary-fixed bg-surface-container-highest">
          <span class="material-symbols-outlined icon-fill text-4xl text-on-surface-variant">person</span>
        </div>
        <div class="flex-1">
          <h1 class="text-headline-md font-semibold">李先生</h1>
          <p class="mt-1 text-body-md text-on-primary-container">138****5678</p>
        </div>
        <button class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors active:bg-white/20">
          <span class="material-symbols-outlined text-xl">settings</span>
        </button>
      </div>
    </section>

    <div class="-mt-6 px-margin-page">
      <section class="rounded-xl border border-surface-variant bg-surface-container-lowest p-inset-card shadow-soft">
        <div class="flex items-center justify-between">
          <div class="flex-1 text-center">
            <p class="text-display-lg text-primary">{{ orders.length }}</p>
            <p class="mt-1 text-label-md text-on-surface-variant">我的预约</p>
          </div>
          <div class="mx-2 h-10 w-px bg-surface-variant" />
          <div class="flex-1 text-center">
            <p class="text-display-lg text-primary">{{ activeCount }}</p>
            <p class="mt-1 text-label-md text-on-surface-variant">处理中</p>
          </div>
          <div class="mx-2 h-10 w-px bg-surface-variant" />
          <div class="flex-1 text-center">
            <p class="text-display-lg text-primary">{{ completedCount }}</p>
            <p class="mt-1 text-label-md text-on-surface-variant">已完成</p>
          </div>
        </div>
      </section>
    </div>

    <section class="mt-stack-lg flex-1 px-margin-page">
      <h2 class="mb-stack-sm text-headline-sm text-on-surface">服务中心</h2>
      <div class="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-subtle">
        <RouterLink
          v-for="(item, index) in serviceItems"
          :key="item.to"
          :to="item.to"
          class="group relative flex items-center px-inset-card py-4 transition-colors active:bg-surface-container-low"
        >
          <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary-container/10">
            <span class="material-symbols-outlined text-lg text-primary" :class="item.fill ? 'icon-fill' : ''">{{ item.icon }}</span>
          </div>
          <span class="flex-1 text-body-lg text-on-surface">{{ item.label }}</span>
          <span class="material-symbols-outlined text-sm text-on-surface-variant transition-transform group-active:translate-x-1">chevron_right</span>
          <div v-if="index < serviceItems.length - 1" class="absolute bottom-0 left-14 right-4 h-px bg-surface-variant" />
        </RouterLink>
      </div>

      <h2 class="mb-stack-sm mt-stack-lg text-headline-sm text-on-surface">帮助与支持</h2>
      <div class="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-subtle">
        <RouterLink
          v-for="(item, index) in supportItems"
          :key="item.to"
          :to="item.to"
          class="group relative flex items-center px-inset-card py-4 transition-colors active:bg-surface-container-low"
        >
          <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container">
            <span class="material-symbols-outlined text-lg text-on-surface-variant">{{ item.icon }}</span>
          </div>
          <span class="flex-1 text-body-lg text-on-surface">{{ item.label }}</span>
          <span class="material-symbols-outlined text-sm text-on-surface-variant transition-transform group-active:translate-x-1">chevron_right</span>
          <div v-if="index < supportItems.length - 1" class="absolute bottom-0 left-14 right-4 h-px bg-surface-variant" />
        </RouterLink>
      </div>
    </section>

    <div class="mt-auto flex items-center justify-center pb-8 pt-stack-lg">
      <div class="flex items-center gap-1.5 opacity-60">
        <span class="material-symbols-outlined icon-fill text-sm text-primary">shield</span>
        <span class="text-label-sm uppercase tracking-widest text-on-surface-variant">国家认证报废机动车回收拆解企业</span>
      </div>
    </div>
  </main>

  <MobileBottomNav />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import type { ScrapOrderSummary } from "@car/shared-types";
import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";
import { getMyOrders } from "@/services/orders";

const orders = ref<ScrapOrderSummary[]>([]);

const activeCount = computed(() => orders.value.filter((item) => item.currentStatus !== "completed").length);
const completedCount = computed(() => orders.value.filter((item) => item.currentStatus === "completed").length);

const serviceItems = [
  { to: "/customer/me", label: "我的预约", icon: "calendar_month", fill: true },
  { to: "/customer/progress/order-demo-001", label: "报废进度", icon: "pending_actions", fill: true },
  { to: "/customer/support", label: "地址管理", icon: "location_on", fill: true },
];

const supportItems = [
  { to: "/customer/guide", label: "常见问题", icon: "help" },
  { to: "/customer/support", label: "联系客服", icon: "support_agent" },
];

onMounted(async () => {
  orders.value = await getMyOrders();
});
</script>
