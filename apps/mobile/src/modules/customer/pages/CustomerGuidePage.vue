<template>
  <section class="space-y-stack-lg px-margin-page py-stack-lg">
    <div class="space-y-3">
      <RouterLink to="/customer" class="text-sm font-medium text-primary">返回首页</RouterLink>
      <h1 class="text-3xl font-semibold text-on-surface">{{ guide?.title || "车辆报废流程指南" }}</h1>
      <p class="text-sm leading-7 text-on-surface-variant">{{ guide?.intro }}</p>
    </div>

    <section class="space-y-3">
      <article
        v-for="(step, index) in guide?.steps || []"
        :key="step.title"
        class="rounded-3xl border border-surface-variant bg-white p-inset-card shadow-soft"
      >
        <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {{ index + 1 }}
        </div>
        <h2 class="text-lg font-semibold text-on-surface">{{ step.title }}</h2>
        <p class="mt-2 text-sm leading-7 text-on-surface-variant">{{ step.description }}</p>
      </article>
    </section>

    <section class="space-y-3 rounded-3xl bg-slate-950 p-6 text-white">
      <h2 class="text-xl font-semibold">常见问题</h2>
      <article
        v-for="item in faqs"
        :key="item.id"
        class="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <h3 class="font-medium">{{ item.question }}</h3>
        <p class="mt-2 text-sm leading-6 text-white/75">{{ item.answer }}</p>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import type { FaqItem, ServiceGuideContent } from "@car/shared-types";
import { getFaqs, getServiceGuide } from "@/services/content";

const guide = ref<ServiceGuideContent | null>(null);
const faqs = ref<FaqItem[]>([]);

onMounted(async () => {
  const [guideData, faqData] = await Promise.all([getServiceGuide(), getFaqs()]);
  guide.value = guideData;
  faqs.value = faqData;
});
</script>
