<template>
  <main class="min-h-screen bg-surface pb-8">
    <header class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#ececec] bg-[#f8faf9] px-5">
      <RouterLink to="/customer/me" class="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-outline transition-colors active:bg-surface-container">
        <span class="material-symbols-outlined">arrow_back</span>
      </RouterLink>
      <div class="flex-1 text-center">
        <h1 class="text-base font-semibold tracking-tight text-primary">Vehicle Recycling</h1>
      </div>
      <div class="w-10" />
    </header>

    <main class="mx-auto flex max-w-md flex-col gap-stack-lg px-margin-page pb-[80px] pt-[18px]">
      <div class="flex flex-col gap-stack-sm">
        <h2 class="text-headline-md text-on-surface">进度追踪</h2>
        <div class="flex items-center gap-2">
          <span class="rounded bg-surface-container-high px-2 py-1 text-label-md text-outline">订单号: {{ order?.orderNo || route.params.orderId }}</span>
        </div>
      </div>

      <section
        v-if="order"
        class="relative overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest p-inset-card shadow-subtle"
      >
        <div class="absolute left-0 top-0 h-1 w-full bg-primary" />

        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <span class="text-label-md uppercase tracking-wider text-primary">当前状态</span>
            <h3 class="text-headline-sm text-on-surface">{{ order.currentStatusLabel }}</h3>
            <p class="mt-1 text-body-md text-on-surface-variant">{{ currentNote }}</p>
          </div>
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <span class="material-symbols-outlined icon-fill text-2xl">local_shipping</span>
          </div>
        </div>

        <div class="relative mt-4 h-[120px] overflow-hidden rounded-lg border border-surface-variant bg-[linear-gradient(135deg,#e8f0f0_0%,#f7f7f7_45%,#e3eded_100%)]">
          <div class="absolute inset-0 opacity-40 [background-image:linear-gradient(90deg,transparent_0%,transparent_48%,#cfd8d8_50%,transparent_52%,transparent_100%),linear-gradient(transparent_0%,transparent_48%,#d5dfdf_50%,transparent_52%,transparent_100%)] [background-size:48px_48px]" />
          <div class="absolute left-6 top-5 h-1 w-24 rotate-[-10deg] bg-primary/60" />
          <div class="absolute left-24 top-8 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_6px_rgba(0,76,76,0.12)]" />

          <div class="absolute bottom-2 left-2 right-2 flex items-center gap-3 rounded-md border border-surface-variant bg-white/90 p-2 backdrop-blur-sm">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <span class="material-symbols-outlined text-sm">person</span>
            </div>
            <div class="flex-1">
              <p class="text-label-sm text-on-surface">王师傅（拖车专员）</p>
              <p class="text-[10px] text-outline">京A·T9283</p>
            </div>
            <a :href="`tel:${supportPhone}`" class="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface text-primary">
              <span class="material-symbols-outlined icon-fill text-sm">call</span>
            </a>
          </div>
        </div>
      </section>

      <section v-if="order" class="rounded-xl border border-surface-variant bg-surface-container-lowest p-inset-card shadow-subtle">
        <h3 class="mb-6 text-label-md uppercase tracking-wider text-on-surface-variant">业务流转明细</h3>
        <div class="relative pl-4">
          <div class="absolute left-[23px] top-4 bottom-8 w-[2px] rounded-full bg-surface-container-high" />
          <div class="absolute left-[23px] top-4 w-[2px] rounded-full bg-primary" :style="{ height: progressHeight }" />

          <div
            v-for="(item, index) in timelineItems"
            :key="`${item.label}-${index}`"
            class="relative flex gap-4 pb-6 last:pb-0"
          >
            <div
              class="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-4 border-surface-container-lowest"
              :class="nodeClass(item.state)"
            >
              <span v-if="item.state === 'done'" class="material-symbols-outlined icon-fill text-[14px] text-white">check</span>
              <div v-else-if="item.state === 'current'" class="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div
              class="flex flex-1 flex-col pt-1"
              :class="item.state === 'current' ? 'rounded-lg border border-surface-variant bg-surface p-3 -mt-2 shadow-sm' : ''"
            >
              <span :class="item.state === 'pending' ? 'text-body-md text-outline' : item.state === 'current' ? 'text-body-lg font-medium text-primary' : 'text-body-md font-medium text-on-surface'">
                {{ item.label }}
              </span>
              <span v-if="item.time" class="text-label-sm text-outline">{{ item.time }}</span>
              <span v-if="item.note && item.state === 'current'" class="text-label-sm text-outline">{{ item.note }}</span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="order" class="rounded-xl border border-surface-variant bg-surface-container-lowest p-inset-card shadow-subtle">
        <div class="flex items-center gap-2 border-b border-surface-variant pb-3">
          <span class="material-symbols-outlined text-on-surface-variant">directions_car</span>
          <h3 class="text-headline-sm text-on-surface">报废车辆信息</h3>
        </div>

        <div class="grid grid-cols-2 gap-x-4 gap-y-5 pt-4">
          <div class="flex flex-col gap-1">
            <span class="text-label-sm uppercase text-outline">车牌号码</span>
            <div class="inline-flex">
              <span class="rounded border border-outline-variant/30 bg-surface-container-highest px-2 py-1 tracking-wider text-on-surface">{{ order.plateNumber }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-label-sm uppercase text-outline">车辆型号</span>
            <span class="text-body-md font-medium text-on-surface">{{ order.brandModel }}</span>
          </div>
          <div class="col-span-2 flex flex-col gap-1">
            <span class="text-label-sm uppercase text-outline">车架号 (VIN)</span>
            <span class="break-all font-mono text-[14px] text-on-surface">{{ order.vin }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-label-sm uppercase text-outline">所有人</span>
            <span class="text-body-md text-on-surface">{{ order.ownerName }}</span>
          </div>
        </div>
      </section>

      <RouterLink
        to="/customer/support"
        class="flex h-12 items-center justify-center gap-2 rounded-lg border border-outline bg-white text-body-md font-medium text-on-surface-variant"
      >
        <span class="material-symbols-outlined text-[18px]">support_agent</span>
        联系客服协助
      </RouterLink>
    </main>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import type { ScrapOrderDetail } from "@car/shared-types";
import { getOrderProgress } from "@/services/orders";

const route = useRoute();
const order = ref<ScrapOrderDetail | null>(null);
const supportPhone = "400-800-8899";

const flowTemplate = [
  { status: "submitted", label: "已提交" },
  { status: "contacted", label: "联系中" },
  { status: "quoted", label: "估价完成" },
  { status: "scheduled_pickup", label: "已安排上门/拖车" },
  { status: "dismantling", label: "拆解中" },
  { status: "deregistration_processing", label: "办理注销证明" },
  { status: "completed", label: "已完成" },
] as const;

const currentNote = computed(() => order.value?.timeline.find((item) => item.status === order.value?.currentStatus)?.note ?? "工作人员将持续同步当前处理进度。");

const timelineItems = computed(() => {
  if (!order.value) return [];

  const currentIndex = flowTemplate.findIndex((item) => item.status === order.value?.currentStatus);
  return flowTemplate.map((item, index) => {
    const matched = order.value?.timeline.find((entry) => entry.status === item.status);
    const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "pending";
    return {
      ...item,
      time: matched?.time ?? "",
      note: matched?.note ?? "",
      state,
    };
  });
});

const progressHeight = computed(() => {
  const currentIndex = timelineItems.value.findIndex((item) => item.state === "current");
  const segments = Math.max(currentIndex, 0);
  return `${segments * 48 + 36}px`;
});

function nodeClass(state: string) {
  if (state === "done") return "bg-primary";
  if (state === "current") return "bg-primary-container outline outline-2 outline-primary";
  return "bg-surface-container-high";
}

onMounted(async () => {
  order.value = await getOrderProgress(String(route.params.orderId));
});
</script>
