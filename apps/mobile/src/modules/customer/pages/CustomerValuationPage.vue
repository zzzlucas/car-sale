<template>
  <section class="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-surface-variant bg-surface-container-lowest px-margin-page">
    <RouterLink to="/customer" class="text-sm font-medium text-primary">返回</RouterLink>
    <h1 class="text-lg font-semibold text-on-surface">车辆估价评估</h1>
    <span class="w-8" />
  </section>

  <section class="px-margin-page py-stack-lg">
    <div class="mb-8 flex items-center justify-between px-2">
      <div class="flex flex-col items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">1</div>
        <span class="text-xs font-semibold text-primary">基本信息</span>
      </div>
      <div class="h-[2px] flex-1 bg-surface-variant" />
      <div class="flex flex-col items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-xs font-semibold text-on-surface-variant">2</div>
        <span class="text-xs text-on-surface-variant">车辆照片</span>
      </div>
      <div class="h-[2px] flex-1 bg-surface-variant" />
      <div class="flex flex-col items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-xs font-semibold text-on-surface-variant">3</div>
        <span class="text-xs text-on-surface-variant">评估结果</span>
      </div>
    </div>

    <div class="mb-4">
      <h2 class="text-2xl font-semibold text-on-surface">填写车辆基本信息</h2>
      <p class="mt-2 text-sm leading-6 text-on-surface-variant">
        提供准确的车辆信息，有助于客服更快联系并给出精准回收估价。
      </p>
    </div>

    <form class="space-y-4 rounded-3xl border border-surface-variant bg-white p-inset-card shadow-soft" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label class="text-sm font-medium text-on-surface">车辆类型</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="item in vehicleTypes"
            :key="item.value"
            type="button"
            class="rounded-2xl border px-4 py-3 text-sm font-medium transition"
            :class="form.vehicleType === item.value ? 'border-primary bg-primary/5 text-primary' : 'border-surface-variant text-on-surface-variant'"
            @click="form.vehicleType = item.value"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-on-surface">车辆品牌与型号</label>
        <input
          v-model="form.brandModel"
          type="text"
          placeholder="例如：大众 帕萨特"
          class="w-full rounded-2xl border border-surface-variant px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-on-surface">是否保留原车牌号</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="rounded-2xl border px-4 py-3 text-sm font-medium transition"
            :class="form.plateRetention ? 'border-primary bg-primary/5 text-primary' : 'border-surface-variant text-on-surface-variant'"
            @click="form.plateRetention = true"
          >
            是，申请保留
          </button>
          <button
            type="button"
            class="rounded-2xl border px-4 py-3 text-sm font-medium transition"
            :class="!form.plateRetention ? 'border-primary bg-primary/5 text-primary' : 'border-surface-variant text-on-surface-variant'"
            @click="form.plateRetention = false"
          >
            否，直接注销
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-on-surface">车辆整备质量（吨）</label>
        <input
          v-model="form.weightTons"
          type="number"
          step="0.1"
          placeholder="请查看行驶证，轿车可不填"
          class="w-full rounded-2xl border border-surface-variant px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
      </div>

      <div class="grid gap-4 border-t border-surface-variant pt-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-on-surface">联系人姓名</label>
          <input
            v-model="form.contactName"
            type="text"
            placeholder="请输入联系人姓名"
            class="w-full rounded-2xl border border-surface-variant px-4 py-3 text-sm outline-none transition focus:border-primary"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-on-surface">联系电话</label>
          <input
            v-model="form.contactPhone"
            type="tel"
            placeholder="请输入联系电话"
            class="w-full rounded-2xl border border-surface-variant px-4 py-3 text-sm outline-none transition focus:border-primary"
          />
        </div>
      </div>

      <div class="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-primary">
        信息加密传输，仅用于车辆估价和预约联系。
      </div>

      <div v-if="message" class="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
        {{ message }}
      </div>

      <button
        type="submit"
        class="flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-white"
        :disabled="submitting"
      >
        {{ submitting ? "提交中..." : "提交估价预约" }}
      </button>
    </form>
  </section>

  <MobileBottomNav />
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

import type { ValuationOrderPayload } from "@car/shared-types";
import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";
import { submitValuationOrder } from "@/services/orders";

const router = useRouter();
const submitting = ref(false);
const message = ref("");

const form = reactive<ValuationOrderPayload>({
  vehicleType: "car",
  brandModel: "",
  plateRetention: false,
  weightTons: null,
  contactName: "",
  contactPhone: "",
});

const vehicleTypes = [
  { value: "car", label: "小型轿车" },
  { value: "truck", label: "货车 / 客车" },
] as const;

async function handleSubmit() {
  if (!form.brandModel || !form.contactName || !form.contactPhone) {
    message.value = "请先补全品牌型号、联系人姓名和联系电话。";
    return;
  }

  submitting.value = true;
  message.value = "";

  try {
    const result = await submitValuationOrder(form);
    message.value = `预约已提交，订单号 ${result.orderNo}。`;
    await router.push(`/customer/progress/${result.id}`);
  } finally {
    submitting.value = false;
  }
}
</script>
