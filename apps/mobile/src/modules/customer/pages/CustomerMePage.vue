<template>
  <section class="bg-primary px-margin-page pb-10 pt-stack-lg text-white">
    <div class="flex items-center gap-4">
      <div class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-2xl">李</div>
      <div class="flex-1">
        <h1 class="text-2xl font-semibold">游客模式</h1>
        <p class="mt-1 text-sm text-white/75">当前先用示例订单跑通流程，后续可切换手机号登录。</p>
      </div>
    </div>
  </section>

  <section class="-mt-6 space-y-stack-lg px-margin-page">
    <div class="grid grid-cols-3 gap-3 rounded-3xl border border-surface-variant bg-white p-inset-card shadow-soft">
      <div class="text-center">
        <p class="text-3xl font-semibold text-primary">{{ orders.length }}</p>
        <p class="mt-1 text-xs text-on-surface-variant">我的预约</p>
      </div>
      <div class="text-center">
        <p class="text-3xl font-semibold text-primary">{{ activeCount }}</p>
        <p class="mt-1 text-xs text-on-surface-variant">处理中</p>
      </div>
      <div class="text-center">
        <p class="text-3xl font-semibold text-primary">{{ completedCount }}</p>
        <p class="mt-1 text-xs text-on-surface-variant">已完成</p>
      </div>
    </div>

    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-on-surface">我的预约</h2>
      <RouterLink
        v-for="item in orders"
        :key="item.id"
        :to="`/customer/progress/${item.id}`"
        class="block rounded-3xl border border-surface-variant bg-white p-inset-card shadow-soft"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{{ item.orderNo }}</p>
            <h3 class="mt-2 text-lg font-semibold text-on-surface">{{ item.brandModel }}</h3>
            <p class="mt-1 text-sm text-on-surface-variant">{{ item.plateNumber }}</p>
          </div>
          <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {{ item.currentStatusLabel }}
          </span>
        </div>
      </RouterLink>
    </section>

    <section class="overflow-hidden rounded-3xl border border-surface-variant bg-white shadow-soft">
      <RouterLink
        v-for="entry in entries"
        :key="entry.to"
        :to="entry.to"
        class="flex items-center justify-between border-b border-surface-variant px-inset-card py-4 last:border-b-0"
      >
        <div>
          <p class="font-medium text-on-surface">{{ entry.label }}</p>
          <p class="mt-1 text-sm text-on-surface-variant">{{ entry.desc }}</p>
        </div>
        <span class="text-on-surface-variant">›</span>
      </RouterLink>
    </section>
  </section>

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

const entries = [
  { to: "/customer/guide", label: "报废流程说明", desc: "先了解所需材料与办理步骤" },
  { to: "/customer/support", label: "联系客服", desc: "估价、拖车与证明办理都可咨询" },
  { to: "/customer/progress/order-demo-001", label: "查看示例进度", desc: "快速体验订单时间线" },
];

onMounted(async () => {
  orders.value = await getMyOrders();
});
</script>
