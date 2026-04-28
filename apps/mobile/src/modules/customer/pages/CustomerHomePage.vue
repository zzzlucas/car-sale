<template>
  <main class="min-h-screen bg-background pb-mobile-bottom-nav">
    <section class="mesh-bg relative overflow-hidden px-margin-page pb-8 pt-[calc(env(safe-area-inset-top)+14px)]">
      <div class="absolute -left-10 top-12 h-32 w-32 rounded-full bg-primary-fixed/30 blur-3xl" />
      <div class="absolute -right-12 top-20 h-36 w-36 rounded-full bg-secondary-container/15 blur-3xl" />

      <div class="relative mx-auto max-w-md">
        <div class="mb-4 flex items-center justify-between">
          <img :src="homeBrandImage" alt="安心报废" class="h-auto w-[150px] max-w-[52vw]" />
          <RouterLink
            to="/customer/support"
            class="inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-2 text-label-md text-on-surface shadow-subtle backdrop-blur-sm"
          >
            <span class="material-symbols-outlined text-[16px]">support_agent</span>
            联系客服
          </RouterLink>
        </div>

        <RouterLink
          to="/customer/valuation"
          aria-label="立即估价 / 预约回收"
          class="group block overflow-hidden rounded-[32px] bg-primary shadow-premium outline-none transition duration-300 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary-fixed"
        >
          <img
            :src="homeHeroBanner"
            alt="专业、合法、省心的官方认证报废车回收服务"
            class="block h-auto w-full transition duration-500 group-hover:scale-[1.015]"
            fetchpriority="high"
          />
          <span class="sr-only">立即估价 / 预约回收</span>
        </RouterLink>
      </div>
    </section>

    <section class="px-margin-page pt-8 pb-stack-lg">
      <div class="mb-stack-md flex items-end justify-between gap-4">
        <div>
          <p class="text-label-sm uppercase tracking-[0.18em] text-primary/70">为什么选我们</p>
          <h2 class="mt-2 text-headline-md text-on-surface">核心服务优势</h2>
        </div>
        <RouterLink to="/customer/guide" class="text-label-md font-medium text-primary">服务说明</RouterLink>
      </div>

      <div class="overflow-hidden rounded-[28px] border border-surface-variant/70 bg-surface-container-lowest shadow-soft">
        <article
          v-for="item in advantages"
          :key="item.title"
          class="flex items-start gap-4 border-b border-surface-variant/70 px-5 py-5 last:border-b-0"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <span class="material-symbols-outlined">{{ item.icon }}</span>
          </div>
          <div>
            <h3 class="text-body-lg font-medium text-on-surface">{{ item.title }}</h3>
            <p class="mt-1 text-body-md text-on-surface-variant">{{ item.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="px-margin-page py-stack-sm">
      <div class="mb-stack-md flex items-end justify-between gap-4">
        <div>
          <p class="text-label-sm uppercase tracking-[0.18em] text-primary/70">办理流程</p>
          <h2 class="mt-2 text-headline-md text-on-surface">四步完成报废</h2>
        </div>
        <RouterLink to="/customer/guide" class="text-label-md font-medium text-primary">查看详情</RouterLink>
      </div>

      <div class="rounded-[28px] border border-surface-variant/70 bg-surface-container-lowest p-5 shadow-soft">
        <div class="relative">
          <div class="absolute bottom-5 left-4 top-5 w-px bg-surface-variant" />
          <div class="relative flex flex-col gap-6">
            <article v-for="(step, index) in flowSteps" :key="step.title" class="flex items-start gap-4">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-label-sm text-on-primary ring-4 ring-surface-container-lowest">
                {{ index + 1 }}
              </div>
              <div class="pt-0.5">
                <h3 class="text-body-lg font-medium text-on-surface">{{ step.title }}</h3>
                <p class="mt-1 text-body-md text-on-surface-variant">{{ step.desc }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="px-margin-page py-stack-lg">
      <div class="mb-stack-md">
        <p class="text-label-sm uppercase tracking-[0.18em] text-primary/70">常见问题</p>
        <h2 class="mt-2 text-headline-md text-on-surface">先把高频疑问说清楚</h2>
      </div>

      <div class="space-y-3">
        <article
          v-for="item in faqItems"
          :key="item.question"
          class="rounded-3xl border border-surface-variant/70 bg-surface-container-lowest px-5 py-4 shadow-subtle"
        >
          <h3 class="text-body-lg font-medium text-on-surface">{{ item.question }}</h3>
          <p class="mt-2 text-body-md text-on-surface-variant">{{ item.answer }}</p>
        </article>
      </div>
    </section>

    <section class="px-margin-page pb-10 pt-2">
      <div class="rounded-[28px] border border-primary/10 bg-primary px-5 py-6 text-on-primary shadow-premium">
        <p class="text-label-sm uppercase tracking-[0.18em] text-on-primary-container">准备开始</p>
        <h2 class="mt-2 text-headline-md">资料不全也能先问价</h2>
        <p class="mt-2 text-body-md text-on-primary-container/95">
          先提交基础信息拿到初步评估，后续再由专员协助补齐资料和安排拖车。
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <RouterLink
            to="/customer/valuation"
            class="flex h-12 items-center justify-center rounded-2xl bg-white text-label-md font-medium text-primary"
          >
            去估价
          </RouterLink>
          <RouterLink
            to="/customer/support"
            class="flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-label-md font-medium text-on-primary"
          >
            联系客服
          </RouterLink>
        </div>
      </div>

      <p class="mt-5 text-center text-[11px] text-on-surface-variant">平台遵循报废机动车回收管理相关规范，服务流程可追踪、可查询。</p>
    </section>

    <MobileBottomNav />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import type { FaqItem } from "@car/shared-types";
import homeBrandImage from "@/assets/customer-home/brand-mark.png";
import homeHeroBanner from "@/assets/customer-home/banner-hero-full.jpg";
import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";
import { getFaqs } from "@/services/content";

const advantages = [
  { icon: "verified_user", title: "正规资质回收", desc: "按规范拆解并出具所需证明，流程合法可追溯。" },
  { icon: "payments", title: "报价透明清楚", desc: "先给初步估价，再按车况核验，不靠模糊话术压价。" },
  { icon: "directions_car", title: "上门拖车省事", desc: "确认意向后安排上门验车与拖车，减少往返奔波。" },
  { icon: "support_agent", title: "专员全程跟进", desc: "从提交到注销打款都有专人衔接，节点变化及时同步。" },
];

const flowSteps = [
  { title: "线上估价", desc: "提交车辆基础信息，先拿到初步预估和办理建议。" },
  { title: "上门验车", desc: "确认回收意向后，安排专业人员上门核验和拖车。" },
  { title: "合规拆解", desc: "车辆进入正规回收拆解流程，资料与节点同步更新。" },
  { title: "注销结算", desc: "手续办结后完成打款，进度与结果都能回看查询。" },
];

const faqItems = ref<FaqItem[]>([
  { question: "车辆不在本地，还能报废吗？", answer: "多数情况可以先评估可操作性，再由专员沟通异地拖运和资料要求。" },
  { question: "没有把资料准备齐，还能先提交吗？", answer: "可以，首页先引导估价，缺失资料会在后续沟通里补齐，不影响先问价。" },
  { question: "多久能看到办理进度？", answer: "提交后即可进入进度链路，关键节点会持续更新，避免一直靠电话追问。" },
].map((item, index) => ({ id: `home-faq-${index + 1}`, ...item })));

onMounted(async () => {
  faqItems.value = await getFaqs();
});
</script>
