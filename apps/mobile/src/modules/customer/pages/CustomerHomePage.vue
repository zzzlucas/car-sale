<template>
  <section class="relative overflow-hidden bg-primary px-margin-page pb-14 pt-10 text-white">
    <div class="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
    <div class="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-white/5 blur-2xl" />
    <div class="relative z-10 space-y-6">
      <p class="text-sm uppercase tracking-[0.35em] text-white/70">Professional Recycling</p>
      <div class="space-y-3">
        <h1 class="max-w-[11ch] text-4xl font-semibold leading-tight">专业 · 合法 · 省心</h1>
        <p class="max-w-[20rem] text-base leading-7 text-white/75">
          官方认证车辆报废回收服务，极速办理注销证明，资金安全有保障。
        </p>
      </div>
      <RouterLink
        to="/customer/valuation"
        class="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-base font-semibold text-primary shadow-soft"
      >
        立即估价 / 预约回收
      </RouterLink>
    </div>
  </section>

  <section class="space-y-stack-lg px-margin-page py-stack-lg">
    <div class="grid gap-3">
      <article
        v-for="item in highlights"
        :key="item.title"
        class="rounded-2xl border border-surface-variant bg-surface-container-lowest p-inset-card shadow-soft"
      >
        <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {{ item.eyebrow }}
        </div>
        <h2 class="text-xl font-semibold text-on-surface">{{ item.title }}</h2>
        <p class="mt-2 text-sm leading-6 text-on-surface-variant">{{ item.description }}</p>
      </article>
    </div>

    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-on-surface">办理流程</h2>
        <RouterLink to="/customer/guide" class="text-sm font-medium text-primary">查看详情</RouterLink>
      </div>
      <div class="space-y-3">
        <article
          v-for="(step, index) in guide.steps"
          :key="step.title"
          class="flex gap-4 rounded-2xl border border-surface-variant bg-white p-inset-card"
        >
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {{ index + 1 }}
          </div>
          <div>
            <h3 class="font-semibold text-on-surface">{{ step.title }}</h3>
            <p class="mt-1 text-sm leading-6 text-on-surface-variant">{{ step.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="rounded-[28px] bg-slate-950 p-6 text-white">
      <div class="space-y-2">
        <p class="text-xs uppercase tracking-[0.25em] text-white/60">进度可查</p>
        <h2 class="text-2xl font-semibold">提交后全程有记录，不怕流程不透明</h2>
        <p class="text-sm leading-6 text-white/70">
          从客服联系到拖车安排，再到拆解和注销办理，每一步都可以查询。
        </p>
      </div>
      <div class="mt-6 flex gap-3">
        <RouterLink
          to="/customer/me"
          class="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950"
        >
          查看示例订单
        </RouterLink>
        <RouterLink
          to="/customer/support"
          class="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-medium text-white"
        >
          联系客服
        </RouterLink>
      </div>
    </section>
  </section>

  <MobileBottomNav />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import type { ServiceGuideContent } from "@car/shared-types";
import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";
import { getServiceGuide } from "@/services/content";

const guide = ref<ServiceGuideContent>({
  title: "",
  intro: "",
  steps: [],
});

const highlights = [
  {
    eyebrow: "合规回收",
    title: "国家认证回收拆解企业对接",
    description: "把信任前置，用正规资质和透明流程替代用户对黑中介和流程不清的担心。",
  },
  {
    eyebrow: "拖车安排",
    title: "无法行驶也能预约处理",
    description: "确认资料后安排拖车，减少用户线下到场和自行协调的负担。",
  },
];

onMounted(async () => {
  guide.value = await getServiceGuide();
});
</script>
