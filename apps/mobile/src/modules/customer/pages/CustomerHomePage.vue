<template>
  <header class="glass-panel fixed left-0 right-0 top-0 z-30 h-16">
    <div class="mx-auto flex h-full w-full max-w-md items-center justify-between px-margin-page">
      <div class="flex items-center gap-3 text-primary">
        <span class="material-symbols-outlined">arrow_back</span>
        <span class="text-lg font-semibold tracking-wide">Vehicle Recycling</span>
      </div>
      <span class="material-symbols-outlined text-primary">more_horiz</span>
    </div>
  </header>

  <main class="pb-24 pt-16">
    <section class="mesh-bg relative overflow-hidden rounded-b-[2.5rem] px-6 pb-16 pt-12 shadow-sm">
      <div class="relative z-10 flex flex-col items-center text-center">
        <div class="relative mb-8">
          <div class="absolute inset-0 rounded-full bg-secondary-container blur-2xl opacity-20" />
          <div class="relative z-10 flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-primary text-[#FBF8F1] shadow-premium">
            <span class="material-symbols-outlined icon-fill text-4xl">recycling</span>
          </div>
        </div>

        <h1 class="mb-4 text-3xl font-bold tracking-tight text-primary">专业 · 合法 · 省心</h1>
        <p class="mb-10 max-w-[300px] text-base font-light leading-relaxed text-outline">
          官方认证车辆报废回收服务，极速办理注销证明，资金安全有保障。
        </p>

        <RouterLink
          to="/customer/valuation"
          class="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-lg font-medium text-on-primary shadow-premium transition-all active:scale-[0.98]"
        >
          <span class="material-symbols-outlined icon-fill text-secondary-container">directions_car</span>
          立即估价 / 预约回收
        </RouterLink>

        <div class="mt-8 flex w-full items-center justify-center gap-8 border-t border-outline/10 pt-6">
          <div v-for="item in trustItems" :key="item.label" class="flex flex-col items-center gap-1.5">
            <span class="material-symbols-outlined text-lg text-secondary">{{ item.icon }}</span>
            <span class="text-xs font-medium tracking-wide text-outline">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-16 px-6">
      <div class="mb-8 flex items-center gap-3">
        <div class="h-px flex-1 bg-primary/20" />
        <h2 class="text-xl font-semibold tracking-wide text-primary">核心优势</h2>
        <div class="h-px flex-1 bg-primary/20" />
      </div>

      <div class="grid grid-cols-1 gap-6">
        <template v-for="(item, index) in advantages" :key="item.title">
          <article class="group flex items-start gap-5">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#edf0f1] bg-white text-primary shadow-sm transition-colors group-hover:border-secondary-container/40">
              <span class="material-symbols-outlined text-2xl">{{ item.icon }}</span>
            </div>
            <div>
              <h3 class="mb-1 text-base font-semibold text-on-surface">{{ item.title }}</h3>
              <p class="text-sm font-light leading-relaxed text-outline">{{ item.description }}</p>
            </div>
          </article>
          <div v-if="index < advantages.length - 1" class="h-px w-full bg-gradient-to-r from-transparent via-[#edf0f1] to-transparent" />
        </template>
      </div>
    </section>

    <section class="mt-20 px-6">
      <div class="mb-10 flex items-center justify-between">
        <h2 class="text-xl font-semibold tracking-wide text-primary">服务流程</h2>
        <RouterLink to="/customer/guide" class="flex items-center text-sm font-medium text-secondary">
          详细指南
          <span class="material-symbols-outlined ml-1 text-base">arrow_forward</span>
        </RouterLink>
      </div>

      <div class="relative border-l border-[#edf0f1] pb-4 pl-6">
        <article v-for="(step, index) in flowSteps" :key="step.title" class="relative mb-10 last:mb-0">
          <div
            class="absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ring-4 ring-[#fafafa]"
            :class="index === 0 ? 'bg-primary text-white' : 'border border-surface-variant bg-white text-primary'"
          >
            {{ index + 1 }}
          </div>
          <h3 class="-mt-1 mb-1 text-base font-semibold text-on-surface">{{ step.title }}</h3>
          <p class="text-sm font-light text-outline">{{ step.description }}</p>
        </article>
      </div>
    </section>

    <section class="mt-20 px-6">
      <h2 class="mb-6 text-xl font-semibold tracking-wide text-primary">常见问题</h2>
      <div class="space-y-4">
        <details
          v-for="item in faqs"
          :key="item.id"
          class="group rounded-2xl border border-[#edf0f1] bg-white p-5 shadow-sm transition-colors open:border-primary/20"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-on-surface">
            <span>{{ item.question }}</span>
            <span class="material-symbols-outlined text-outline transition-transform group-open:rotate-45">add</span>
          </summary>
          <p class="pt-3 text-sm leading-6 text-outline">{{ item.answer }}</p>
        </details>
      </div>

      <div class="mt-8 flex justify-center">
        <RouterLink
          to="/customer/support"
          class="flex items-center gap-2 rounded-xl border border-[#e1e3e4] bg-[#fafafa] px-6 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-white"
        >
          <span class="material-symbols-outlined text-[18px]">headset_mic</span>
          联系专属客服
        </RouterLink>
      </div>
    </section>

    <section class="mb-8 mt-20 border-t border-[#e7e8e9] px-6 pt-10">
      <div class="flex flex-col items-center gap-6">
        <div class="flex w-full items-center justify-center gap-8">
          <div v-for="item in footerBadges" :key="item.label" class="flex flex-col items-center gap-2 opacity-70">
            <span class="material-symbols-outlined text-[22px] text-[#2a2e32]">{{ item.icon }}</span>
            <span class="text-xs tracking-wider text-outline">{{ item.label }}</span>
          </div>
        </div>
        <p class="text-xs font-light text-[#9ca3af]">本平台严格遵守《报废机动车回收管理办法》</p>
      </div>
    </section>
  </main>

  <MobileBottomNav />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import type { FaqItem } from "@car/shared-types";
import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";
import { getFaqs } from "@/services/content";

const faqs = ref<FaqItem[]>([]);

const trustItems = [
  { icon: "verified_user", label: "官方认证" },
  { icon: "currency_yuan", label: "透明报价" },
  { icon: "local_shipping", label: "上门拖车" },
];

const advantages = [
  { icon: "gavel", title: "合法合规", description: "正规拆解，出具官方《报废汽车回收证明》" },
  { icon: "payments", title: "价格透明", description: "系统精准估值，无隐形扣费，极速打款" },
  { icon: "location_on", title: "上门服务", description: "免费上门验车拖车，足不出户办妥" },
  { icon: "support_agent", title: "专人代办", description: "全程 1 对 1 管家服务，代办注销手续" },
];

const flowSteps = [
  { title: "线上估价，提交申请", description: "填写车辆信息获取初步报价，确认后提交回收申请。" },
  { title: "上门验车，免费拖车", description: "专员上门核验车况与手续，现场确认后免费拖车。" },
  { title: "进场拆解，出具证明", description: "车辆进入合规拆解厂，合规拆解并出具回收证明。" },
  { title: "办理注销，结算打款", description: "代办车管所注销手续，完成后极速将尾款打入账户。" },
];

const footerBadges = [
  { icon: "shield", label: "公安部备案" },
  { icon: "article", label: "资质齐全" },
  { icon: "history", label: "进度可查" },
];

onMounted(async () => {
  faqs.value = await getFaqs();
});
</script>
