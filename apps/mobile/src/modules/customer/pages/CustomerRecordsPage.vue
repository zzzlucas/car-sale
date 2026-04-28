<template>
  <main class="min-h-screen bg-surface pb-mobile-bottom-nav">
    <header class="mobile-page-header fixed left-0 right-0 top-0 z-20 border-b border-surface-variant bg-white">
      <div class="mobile-page-header__bar mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <button
          class="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container"
          @click="goBack"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="mobile-page-header__title text-lg font-semibold tracking-tight text-primary">预约记录</h1>
        <div class="w-10" />
      </div>
    </header>

    <section class="mobile-page-header-offset mx-auto flex max-w-md flex-col px-margin-page pb-[84px] pt-14">
      <div class="flex flex-col gap-stack-sm pb-stack-md pt-stack-lg">
        <h2 class="text-headline-md text-on-surface">预约记录</h2>
        <p class="text-body-md text-on-surface-variant">查看并管理您的报废业务进度</p>
        <div class="mt-stack-sm flex gap-gutter-grid">
          <button
            v-for="item in filters"
            :key="item.value"
            type="button"
            class="rounded-full border px-4 py-1.5 text-label-md transition-colors"
            :class="
              activeFilter === item.value
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant bg-surface-container-high text-on-surface-variant'
            "
            @click="activeFilter = item.value"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="rounded-xl border border-surface-variant bg-white px-4 py-6 text-center text-body-md text-on-surface-variant">
        正在同步后端订单...
      </div>

      <div
        v-else-if="errorMessage"
        class="rounded-xl border border-error/20 bg-white px-4 py-6 text-center"
      >
        <p class="text-body-md text-on-surface">{{ errorMessage }}</p>
        <button
          type="button"
          class="mt-4 rounded-full bg-primary px-4 py-2 text-label-md text-on-primary"
          @click="loadOrders"
        >
          重新加载
        </button>
      </div>

      <div
        v-else-if="!filteredOrders.length"
        class="rounded-2xl border border-surface-variant bg-white px-5 py-8 text-center shadow-subtle"
      >
        <span class="material-symbols-outlined text-[32px] text-outline">receipt_long</span>
        <h3 class="mt-3 text-headline-sm text-on-surface">还没有预约记录</h3>
        <p class="mt-2 text-body-md text-on-surface-variant">
          提交第一笔估价预约后，这里会展示后端返回的真实订单。
        </p>
        <RouterLink
          to="/customer/valuation"
          class="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-label-md text-on-primary"
        >
          去提交预约
        </RouterLink>
      </div>

      <div v-else class="flex flex-col gap-stack-md">
        <article
          v-for="item in filteredOrders"
          :key="item.id"
          class="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-subtle"
        >
          <div class="flex flex-col gap-stack-md p-inset-card">
            <div class="flex items-center justify-between border-b border-surface-variant pb-stack-sm">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-outline">receipt_long</span>
                <span class="text-label-md uppercase text-on-surface-variant">No. {{ item.orderNo }}</span>
              </div>
              <span
                class="rounded px-2.5 py-1 text-label-sm"
                :class="
                  item.currentStatus === 'completed'
                    ? 'bg-primary text-on-primary'
                    : 'bg-secondary-container text-on-secondary-container'
                "
              >
                {{ item.currentStatusLabel }}
              </span>
            </div>

            <div class="flex items-start gap-gutter-grid">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                <span
                  class="material-symbols-outlined text-[28px]"
                  :class="item.currentStatus === 'completed' ? 'text-outline' : 'icon-fill text-primary'"
                >
                  directions_car
                </span>
              </div>
              <div class="w-full">
                <h3 class="text-headline-sm text-on-surface">{{ item.brandModel }}</h3>
                <div class="mt-2 flex items-center justify-between gap-3">
                  <span
                    class="rounded border border-outline-variant bg-surface-container-high px-2 py-0.5 text-label-sm tracking-wider text-on-surface"
                  >
                    {{ item.plateNumber || "待确认车牌" }}
                  </span>
                  <span class="text-label-md text-on-surface-variant">{{ item.contactName }}</span>
                </div>
                <p class="mt-3 line-clamp-2 text-body-md text-on-surface-variant">
                  {{ item.pickupAddress }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 pt-stack-sm">
              <div class="flex items-center gap-1.5 text-on-surface-variant">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                <span class="text-body-md">{{ item.updatedAt || "最近更新" }}</span>
              </div>
              <RouterLink :to="`/customer/progress/${item.id}`" class="text-label-md font-bold text-primary">
                查看详情
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </section>

    <MobileBottomNav />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

import type { ScrapOrderSummary } from "@car/shared-types";
import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";
import { getMyOrders } from "@/services/orders";

const router = useRouter();
const orders = ref<ScrapOrderSummary[]>([]);
const activeFilter = ref<"all" | "processing" | "completed">("all");
const loading = ref(false);
const errorMessage = ref("");

const filters = [
  { value: "all", label: "全部" },
  { value: "processing", label: "处理中" },
  { value: "completed", label: "已完成" },
] as const;

const filteredOrders = computed(() => {
  if (activeFilter.value === "completed") {
    return orders.value.filter(item => item.currentStatus === "completed");
  }
  if (activeFilter.value === "processing") {
    return orders.value.filter(item => item.currentStatus !== "completed");
  }
  return orders.value;
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/customer/me");
}

async function loadOrders() {
  loading.value = true;
  errorMessage.value = "";

  try {
    orders.value = await getMyOrders();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `订单加载失败：${error.message}` : "订单加载失败，请稍后重试。";
  } finally {
    loading.value = false;
  }
}

onMounted(loadOrders);
</script>
