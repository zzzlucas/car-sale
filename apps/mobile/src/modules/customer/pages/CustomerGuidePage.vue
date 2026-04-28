<template>
  <main class="min-h-screen bg-background pb-24">
    <header class="mobile-page-header sticky top-0 z-20 border-b border-surface-variant bg-white">
      <div class="mobile-page-header__bar mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <button class="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container" @click="goBack">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="mobile-page-header__title text-lg font-semibold text-primary">报废流程指南</h1>
        <div class="w-10" />
      </div>
    </header>

    <section class="mx-auto max-w-md space-y-stack-lg px-margin-page py-stack-lg">
      <section>
        <h2 class="mb-stack-sm text-display-lg text-primary">{{ guide?.title || "车辆报废流程指南" }}</h2>
        <p class="text-body-lg text-on-surface-variant">
          {{ guide?.intro || "轻松了解从估价到注销的每一个步骤，让您的爱车合规、环保地完成最后使命。" }}
        </p>
      </section>

      <section class="space-y-stack-md">
        <h3 class="flex items-center gap-2 text-headline-md text-on-surface">
          <span class="material-symbols-outlined text-primary">route</span>
          核心流程
        </h3>

        <div class="grid grid-cols-1 gap-gutter-grid">
          <article
            v-for="(step, index) in guideSteps"
            :key="step.title"
            class="relative overflow-hidden rounded-lg border border-surface-variant bg-surface-container-lowest p-inset-card shadow-subtle"
          >
            <div class="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-primary/5" :class="index === 1 ? 'bg-secondary-container/10' : index === 2 ? 'bg-tertiary-container/10' : ''" />
            <div class="relative z-10 flex items-start gap-4">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-headline-sm"
                :class="index === 0 ? 'bg-primary text-on-primary' : 'border-2 border-surface-dim bg-surface-container-highest text-on-surface-variant'"
              >
                {{ index + 1 }}
              </div>
              <div>
                <h4 class="mb-1 text-headline-sm text-on-surface">{{ step.title }}</h4>
                <p class="text-body-md text-on-surface-variant">{{ step.description }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="rounded-xl border border-primary-fixed-dim bg-primary-fixed/20 p-inset-card">
        <h3 class="mb-stack-md flex items-center gap-2 text-headline-md text-on-primary-fixed-variant">
          <span class="material-symbols-outlined text-primary">inventory</span>
          准备材料清单
        </h3>
        <ul class="space-y-3">
          <li v-for="item in materials" :key="item.title" class="flex items-center gap-3 rounded-lg border border-surface-variant bg-surface-container-lowest p-3">
            <span class="material-symbols-outlined text-primary">{{ item.icon }}</span>
            <div class="flex-1">
              <span class="block text-label-md text-on-surface">{{ item.title }}</span>
              <span class="text-label-sm text-on-surface-variant">{{ item.desc }}</span>
            </div>
          </li>
        </ul>
        <div class="mt-4 flex items-start gap-2 rounded-lg bg-primary-fixed/30 p-3 text-on-primary-fixed-variant">
          <span class="material-symbols-outlined icon-fill shrink-0 text-primary">info</span>
          <p class="text-label-md">如有交通违章或抵押记录，需在报废前处理完毕，以免影响注销进度。</p>
        </div>
      </section>

      <section class="flex items-center gap-gutter-grid rounded-lg border border-surface-variant bg-surface-container-lowest p-inset-card">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
          <span class="material-symbols-outlined text-3xl text-on-surface-variant">schedule</span>
        </div>
        <div class="flex-1">
          <h3 class="mb-1 text-headline-sm text-on-surface">预计办理周期</h3>
          <p class="text-body-md text-on-surface-variant">
            从车辆交接到取得注销证明，通常需要
            <strong class="font-semibold text-primary">7-15 个工作日</strong>
            。遇政策调整或节假日可能稍有延迟。
          </p>
        </div>
      </section>

      <section class="space-y-stack-sm pb-stack-lg">
        <h3 class="mb-stack-md flex items-center gap-2 text-headline-md text-on-surface">
          <span class="material-symbols-outlined text-primary">help</span>
          常见问题 (FAQ)
        </h3>

        <details
          v-for="item in faqs"
          :key="item.id"
          class="group rounded-lg border border-surface-variant bg-surface-container-lowest [&_summary::-webkit-details-marker]:hidden"
        >
          <summary class="flex cursor-pointer items-center justify-between p-4 text-body-lg font-medium text-on-surface">
            {{ item.question }}
            <span class="material-symbols-outlined transition-transform duration-300 group-open:-rotate-180">expand_more</span>
          </summary>
          <div class="px-4 pb-4 text-body-md text-on-surface-variant">{{ item.answer }}</div>
        </details>
      </section>
    </section>

    <div class="fixed bottom-20 left-margin-page right-margin-page z-20 max-w-md md:left-auto md:w-[300px]">
      <RouterLink
        to="/customer/valuation"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-headline-sm text-on-primary shadow-lg"
      >
        <span class="material-symbols-outlined">monetization_on</span>
        开始免费估价
      </RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

import type { FaqItem, ServiceGuideContent } from "@car/shared-types";
import { getFaqs, getServiceGuide } from "@/services/content";

const router = useRouter();
const guide = ref<ServiceGuideContent | null>(null);
const faqs = ref<FaqItem[]>([]);

const materials = [
  { icon: "badge", title: "车主身份证原件及复印件", desc: "若为代办，需提供代办人身份证及委托书" },
  { icon: "directions_car", title: "机动车行驶证原件", desc: "正副页齐全" },
  { icon: "description", title: "机动车登记证书原件", desc: "俗称“绿本”" },
];

const guideSteps = computed(() => guide.value?.steps ?? []);

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/customer");
}

onMounted(async () => {
  const [guideData, faqData] = await Promise.all([getServiceGuide(), getFaqs()]);
  guide.value = guideData;
  faqs.value = faqData;
});
</script>
