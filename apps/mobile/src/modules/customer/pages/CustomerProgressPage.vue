<template>
  <main class="min-h-screen bg-surface pb-8">
    <header class="sticky top-0 z-20 border-b border-surface-variant bg-white">
      <div class="mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <button
          class="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container"
          @click="goBack"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-lg font-semibold tracking-tight text-primary">车辆报废回收</h1>
        <div class="w-10" />
      </div>
    </header>

    <section class="mx-auto flex max-w-md flex-col gap-stack-lg px-margin-page pb-6 pt-stack-md">
      <section
        v-if="loading"
        class="rounded-xl border border-surface-variant bg-white p-inset-card text-center text-body-md text-on-surface-variant shadow-subtle"
      >
        正在同步订单进度...
      </section>

      <section
        v-else-if="errorMessage"
        class="rounded-xl border border-error/20 bg-white p-inset-card text-center shadow-subtle"
      >
        <p class="text-body-md text-on-surface">{{ errorMessage }}</p>
        <button
          type="button"
          class="mt-4 rounded-full bg-primary px-4 py-2 text-label-md text-on-primary"
          @click="loadOrder"
        >
          重新加载
        </button>
      </section>

      <template v-else-if="order">
        <section class="rounded-xl border border-surface-variant bg-white p-inset-card shadow-subtle">
          <div class="mb-3 flex items-center justify-between border-b border-surface-variant pb-3">
            <div>
              <p class="text-label-md text-on-surface-variant">订单编号</p>
              <p class="mt-1 text-body-lg font-medium text-on-surface">{{ order.orderNo }}</p>
            </div>
            <span class="rounded bg-surface-container-high px-3 py-1 text-label-md text-on-surface-variant">
              {{ order.plateNumber || "待确认车牌" }}
            </span>
          </div>
          <p class="mb-2 flex items-center gap-2 text-label-md text-primary">
            <span class="material-symbols-outlined text-sm">fiber_manual_record</span>
            当前进度
          </p>
          <h2 class="text-[2rem] font-semibold leading-tight text-on-surface">{{ order.currentStatusLabel }}</h2>
          <p class="mt-3 text-body-md text-on-surface-variant">{{ currentNote }}</p>
        </section>

        <section class="rounded-xl border border-surface-variant bg-white p-inset-card shadow-subtle">
          <div class="mb-4 flex items-center gap-2 border-b border-surface-variant pb-3">
            <span class="material-symbols-outlined text-primary">timeline</span>
            <h3 class="text-headline-sm text-on-surface">进度追踪</h3>
          </div>

          <div class="relative pl-7">
            <div class="absolute bottom-5 left-[11px] top-3 w-[2px] bg-surface-container-high" />
            <article
              v-for="(item, index) in timelineItems"
              :key="`${item.label}-${index}`"
              class="relative pb-6 last:pb-0"
            >
              <div
                class="absolute -left-7 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2"
                :class="
                  item.state === 'done'
                    ? 'border-primary bg-primary text-white'
                    : item.state === 'current'
                      ? 'border-primary bg-white text-primary'
                      : 'border-surface-variant bg-white text-transparent'
                "
              >
                <span v-if="item.state === 'done'" class="material-symbols-outlined icon-fill text-[14px]">
                  check
                </span>
                <span v-else-if="item.state === 'current'" class="material-symbols-outlined text-[14px]">
                  radio_button_checked
                </span>
              </div>

              <div :class="item.state === 'current' ? 'rounded-lg border border-primary-fixed-dim bg-[#f2fbfd] p-4' : ''">
                <p
                  :class="
                    item.state === 'current'
                      ? 'text-headline-sm text-primary'
                      : item.state === 'done'
                        ? 'text-body-lg font-medium text-on-surface'
                        : 'text-body-lg text-outline'
                  "
                >
                  {{ item.label }}
                </p>
                <p v-if="item.time" class="mt-1 text-body-md text-on-surface-variant">{{ item.time }}</p>
              </div>
            </article>
          </div>
        </section>

        <section class="rounded-xl border border-surface-variant bg-white p-inset-card shadow-subtle">
          <div class="mb-4 flex items-center gap-2 border-b border-surface-variant pb-3">
            <span class="material-symbols-outlined text-on-surface-variant">info</span>
            <h3 class="text-headline-sm text-on-surface">预约信息</h3>
          </div>

          <div class="grid grid-cols-[96px_1fr] gap-y-4 text-body-md">
            <span class="text-on-surface-variant">联系人</span>
            <span class="text-on-surface">{{ order.contactName }}</span>
            <span class="text-on-surface-variant">联系电话</span>
            <span class="text-on-surface">{{ order.contactPhone }}</span>
            <span class="text-on-surface-variant">取车地址</span>
            <span class="text-on-surface">{{ order.pickupAddress }}</span>
            <span class="text-on-surface-variant">轮毂材质</span>
            <span class="text-on-surface">{{ wheelMaterialLabel }}</span>
            <span class="text-on-surface-variant">整备质量</span>
            <span class="text-on-surface">{{ order.weightTons ? `${order.weightTons} 吨` : "待补充" }}</span>
            <span class="text-on-surface-variant">原车牌</span>
            <span class="text-on-surface">{{ order.plateRetention ? "保留" : "不保留" }}</span>
          </div>

          <div v-if="order.pickupLatitude && order.pickupLongitude" class="mt-4 flex flex-wrap gap-2">
            <span class="rounded-full bg-surface-container px-3 py-1 text-label-md text-primary">
              纬度 {{ order.pickupLatitude }}
            </span>
            <span class="rounded-full bg-surface-container px-3 py-1 text-label-md text-primary">
              经度 {{ order.pickupLongitude }}
            </span>
          </div>
        </section>

        <section class="rounded-xl border border-surface-variant bg-white p-inset-card shadow-subtle">
          <div class="mb-4 flex items-center gap-2 border-b border-surface-variant pb-3">
            <span class="material-symbols-outlined text-on-surface-variant">directions_car</span>
            <h3 class="text-headline-sm text-on-surface">车辆信息</h3>
          </div>

          <div class="grid grid-cols-[96px_1fr] gap-y-4 text-body-md">
            <span class="text-on-surface-variant">车牌号码</span>
            <span class="rounded bg-surface-container-high px-2 py-1 text-on-surface">{{ order.plateNumber || "待确认" }}</span>
            <span class="text-on-surface-variant">品牌车型</span>
            <span class="text-on-surface">{{ order.brandModel }}</span>
            <span class="text-on-surface-variant">VIN 码</span>
            <span class="break-all text-on-surface">{{ order.vin }}</span>
          </div>
        </section>

        <section v-if="order.vehiclePhotos.length" class="rounded-xl border border-surface-variant bg-white p-inset-card shadow-subtle">
          <div class="mb-4 flex items-center gap-2 border-b border-surface-variant pb-3">
            <span class="material-symbols-outlined text-on-surface-variant">photo_library</span>
            <h3 class="text-headline-sm text-on-surface">车辆照片</h3>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <img
              v-for="(photo, index) in order.vehiclePhotos"
              :key="`${photo}-${index}`"
              :src="photo"
              :alt="`车辆照片 ${index + 1}`"
              class="h-28 w-full rounded-xl object-cover"
            />
          </div>
        </section>

        <RouterLink
          to="/customer/support"
          class="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white text-headline-sm text-primary"
        >
          <span class="material-symbols-outlined text-[18px]">support_agent</span>
          联系客服协助
        </RouterLink>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import type { ScrapOrderDetail } from "@car/shared-types";
import { getOrderProgress } from "@/services/orders";

const route = useRoute();
const router = useRouter();
const order = ref<ScrapOrderDetail | null>(null);
const loading = ref(false);
const errorMessage = ref("");

const flowTemplate = [
  { status: "submitted", label: "已提交" },
  { status: "contacted", label: "联系中" },
  { status: "quoted", label: "估价完成" },
  { status: "scheduled_pickup", label: "已安排上门" },
  { status: "picked_up", label: "待拆解" },
  { status: "dismantling", label: "待注销" },
  { status: "completed", label: "已完成" },
] as const;

const currentNote = computed(
  () =>
    order.value?.timeline.find(item => item.status === order.value?.currentStatus)?.note ??
    "客服会尽快与您联系确认车辆与取车信息，请保持电话畅通。",
);

const timelineItems = computed(() => {
  if (!order.value) return [];
  const currentIndex = flowTemplate.findIndex(item => item.status === order.value?.currentStatus);

  return flowTemplate.map((item, index) => {
    const matched = order.value?.timeline.find(entry => entry.status === item.status);
    return {
      ...item,
      time: matched?.time ?? "",
      state: index < currentIndex ? "done" : index === currentIndex ? "current" : "pending",
    };
  });
});

const wheelMaterialLabel = computed(() => {
  switch (order.value?.wheelMaterial) {
    case "steel":
      return "钢轮毂";
    case "aluminum":
      return "铝合金";
    case "other":
      return "其他";
    default:
      return order.value?.wheelMaterial || "待补充";
  }
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/customer/records");
}

async function loadOrder() {
  loading.value = true;
  errorMessage.value = "";

  try {
    order.value = await getOrderProgress(String(route.params.orderId));
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `进度加载失败：${error.message}` : "进度加载失败，请稍后重试。";
  } finally {
    loading.value = false;
  }
}

loadOrder();
</script>
