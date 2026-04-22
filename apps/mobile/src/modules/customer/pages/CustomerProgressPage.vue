<template>
  <section class="space-y-stack-lg px-margin-page py-stack-lg">
    <div class="space-y-2">
      <RouterLink to="/customer/me" class="text-sm font-medium text-primary">返回我的预约</RouterLink>
      <h1 class="text-2xl font-semibold text-on-surface">进度追踪</h1>
      <p class="inline-flex rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant">
        订单号：{{ order?.orderNo || route.params.orderId }}
      </p>
    </div>

    <section v-if="order" class="overflow-hidden rounded-3xl border border-surface-variant bg-white shadow-soft">
      <div class="h-1 bg-primary" />
      <div class="space-y-4 p-inset-card">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-primary">当前状态</p>
            <h2 class="mt-2 text-xl font-semibold text-on-surface">{{ order.currentStatusLabel }}</h2>
            <p class="mt-2 text-sm leading-6 text-on-surface-variant">
              {{ currentNote }}
            </p>
          </div>
          <div class="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {{ order.currentStatus }}
          </div>
        </div>
      </div>
    </section>

    <section v-if="order" class="rounded-3xl border border-surface-variant bg-white p-inset-card">
      <h2 class="mb-5 text-lg font-semibold text-on-surface">业务流转明细</h2>
      <div class="space-y-4">
        <div v-for="item in order.timeline" :key="`${item.status}-${item.time}`" class="flex gap-4">
          <div class="mt-1 h-3 w-3 shrink-0 rounded-full" :class="item.status === order.currentStatus ? 'bg-primary' : 'bg-surface-container-highest'" />
          <div>
            <p class="font-medium text-on-surface">{{ item.label }}</p>
            <p class="text-sm text-on-surface-variant">{{ item.time }}</p>
            <p v-if="item.note" class="mt-1 text-sm leading-6 text-on-surface-variant">{{ item.note }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="order" class="rounded-3xl border border-surface-variant bg-white p-inset-card">
      <h2 class="mb-4 text-lg font-semibold text-on-surface">报废车辆信息</h2>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-on-surface-variant">车牌号码</p>
          <p class="mt-1 font-medium text-on-surface">{{ order.plateNumber }}</p>
        </div>
        <div>
          <p class="text-on-surface-variant">车辆型号</p>
          <p class="mt-1 font-medium text-on-surface">{{ order.brandModel }}</p>
        </div>
        <div>
          <p class="text-on-surface-variant">所有人</p>
          <p class="mt-1 font-medium text-on-surface">{{ order.ownerName }}</p>
        </div>
        <div>
          <p class="text-on-surface-variant">车架号</p>
          <p class="mt-1 break-all font-medium text-on-surface">{{ order.vin }}</p>
        </div>
      </div>
    </section>

    <RouterLink
      to="/customer/support"
      class="flex min-h-12 items-center justify-center rounded-full border border-outline bg-white px-5 text-base font-medium text-on-surface-variant"
    >
      联系客服协助
    </RouterLink>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import type { ScrapOrderDetail } from "@car/shared-types";
import { getOrderProgress } from "@/services/orders";

const route = useRoute();
const order = ref<ScrapOrderDetail | null>(null);

const currentNote = computed(() => order.value?.timeline.at(-1)?.note ?? "客服会持续同步当前进度，请保持电话畅通。");

onMounted(async () => {
  order.value = await getOrderProgress(String(route.params.orderId));
});
</script>
