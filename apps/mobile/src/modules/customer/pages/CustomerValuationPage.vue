<template>
  <main class="min-h-screen bg-background pb-10">
    <header class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#ececec] bg-white px-4">
      <RouterLink to="/customer" class="flex h-10 w-10 items-center justify-center text-outline">
        <span class="material-symbols-outlined">arrow_back</span>
      </RouterLink>
      <h1 class="text-lg font-semibold text-on-surface">车辆估价评估</h1>
      <span class="w-10" />
    </header>

    <section class="px-margin-page py-stack-lg">
      <div class="mb-8 flex items-center justify-between px-1">
        <div class="flex flex-col items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">1</div>
          <span class="text-label-md font-semibold text-primary">基本信息</span>
        </div>
        <div class="mx-3 h-[2px] flex-1 bg-surface-variant" />
        <div class="flex flex-col items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-sm font-semibold text-outline">2</div>
          <span class="text-label-md text-outline">车辆照片</span>
        </div>
        <div class="mx-3 h-[2px] flex-1 bg-surface-variant" />
        <div class="flex flex-col items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-sm font-semibold text-outline">3</div>
          <span class="text-label-md text-outline">评估结果</span>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-[2rem] font-semibold leading-tight text-on-surface">填写车辆基本信息</h2>
        <p class="mt-2 text-body-lg text-on-surface-variant">
          提供准确的车辆信息有助于获取更精准的回收估价。
        </p>
      </div>

      <form class="space-y-stack-md rounded-3xl border border-surface-variant bg-white p-inset-card shadow-soft" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-3 block text-body-md font-medium text-on-surface">车辆类型 <span class="text-[#ba1a1a]">*</span></label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="item in vehicleTypes"
              :key="item.value"
              type="button"
              class="flex h-14 items-center justify-center gap-2 rounded-xl border text-body-md font-medium transition-colors"
              :class="form.vehicleType === item.value ? 'border-primary bg-primary/5 text-primary' : 'border-surface-variant text-on-surface-variant'"
              @click="form.vehicleType = item.value"
            >
              <span class="material-symbols-outlined text-lg" :class="form.vehicleType === item.value ? 'icon-fill' : ''">{{ item.icon }}</span>
              {{ item.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-body-md font-medium text-on-surface">车辆品牌与型号 <span class="text-[#ba1a1a]">*</span></label>
          <div class="flex h-14 items-center rounded-xl border border-surface-variant px-4">
            <span class="material-symbols-outlined mr-3 text-on-surface-variant">directions_car</span>
            <input
              v-model="form.brandModel"
              type="text"
              placeholder="例如：大众 帕萨特"
              class="w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
            />
          </div>
        </div>

        <div class="border-b border-surface-variant pb-stack-md">
          <div class="mb-2 flex items-center justify-between">
            <label class="text-body-md font-medium text-on-surface">是否保留原车牌号 <span class="text-[#ba1a1a]">*</span></label>
            <span class="material-symbols-outlined icon-fill text-sm text-primary">info</span>
          </div>
          <div class="flex flex-wrap gap-5 pt-1 text-body-md text-on-surface">
            <label class="flex items-center gap-2">
              <input v-model="plateRetentionValue" type="radio" class="h-4 w-4 accent-primary" value="yes" />
              是，申请保留
            </label>
            <label class="flex items-center gap-2">
              <input v-model="plateRetentionValue" type="radio" class="h-4 w-4 accent-primary" value="no" />
              否，直接注销
            </label>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-body-md font-medium text-on-surface">车辆整备质量（吨）</label>
          <div class="flex h-14 items-center rounded-xl border border-surface-variant px-4">
            <span class="material-symbols-outlined mr-3 text-on-surface-variant">scale</span>
            <input
              v-model="weightInput"
              type="number"
              step="0.1"
              placeholder="请查看行驶证"
              class="w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
            />
            <span class="text-body-md text-outline">t</span>
          </div>
          <p class="mt-2 text-label-md text-outline">仅货车等特殊车辆必填，小型轿车可不填。</p>
        </div>

        <div class="grid gap-3 border-t border-surface-variant pt-stack-md">
          <div>
            <label class="mb-2 block text-body-md font-medium text-on-surface">联系人姓名 <span class="text-[#ba1a1a]">*</span></label>
            <input
              v-model="form.contactName"
              type="text"
              placeholder="请输入联系人姓名"
              class="h-14 w-full rounded-xl border border-surface-variant px-4 text-body-md outline-none placeholder:text-outline focus:border-primary"
            />
          </div>
          <div>
            <label class="mb-2 block text-body-md font-medium text-on-surface">联系电话 <span class="text-[#ba1a1a]">*</span></label>
            <input
              v-model="form.contactPhone"
              type="tel"
              placeholder="请输入联系电话"
              class="h-14 w-full rounded-xl border border-surface-variant px-4 text-body-md outline-none placeholder:text-outline focus:border-primary"
            />
          </div>
        </div>
      </form>

      <div class="mt-6 rounded-xl border border-primary-fixed-dim bg-primary-fixed/20 px-4 py-3 text-center text-body-md text-on-primary-fixed-variant">
        <span class="material-symbols-outlined icon-fill mr-1 align-[-2px] text-sm text-primary">shield</span>
        信息加密传输，仅用于车辆估价计算
      </div>

      <p v-if="message" class="mt-4 rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface-variant">{{ message }}</p>

      <div class="mt-8 grid grid-cols-2 gap-3">
        <RouterLink
          to="/customer"
          class="flex h-14 items-center justify-center rounded-2xl bg-surface-container-highest text-headline-sm font-semibold text-on-surface-variant"
        >
          取消
        </RouterLink>
        <button
          type="submit"
          form="none"
          class="flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-headline-sm font-semibold text-on-primary disabled:opacity-60"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? "提交中" : "下一步" }}
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

import type { ValuationOrderPayload } from "@car/shared-types";
import { submitValuationOrder } from "@/services/orders";

const router = useRouter();
const submitting = ref(false);
const message = ref("");
const weightInput = ref<string>("");

const form = reactive<ValuationOrderPayload>({
  vehicleType: "car",
  brandModel: "",
  plateRetention: false,
  weightTons: null,
  contactName: "",
  contactPhone: "",
});

const vehicleTypes = [
  { value: "car", label: "小型轿车", icon: "directions_car" },
  { value: "truck", label: "货车/客车", icon: "local_shipping" },
] as const;

const plateRetentionValue = computed({
  get: () => (form.plateRetention ? "yes" : "no"),
  set: (value: string) => {
    form.plateRetention = value === "yes";
  },
});

async function handleSubmit() {
  form.weightTons = weightInput.value ? Number(weightInput.value) : null;

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
