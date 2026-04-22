<template>
  <section class="space-y-stack-lg px-margin-page py-stack-lg">
    <div class="rounded-[32px] bg-slate-950 p-6 text-white">
      <p class="text-xs uppercase tracking-[0.25em] text-white/60">Support</p>
      <h1 class="mt-3 text-3xl font-semibold">在线客服与人工协助</h1>
      <p class="mt-3 text-sm leading-7 text-white/75">{{ support?.intro }}</p>
    </div>

    <section class="space-y-3 rounded-3xl border border-surface-variant bg-white p-inset-card shadow-soft">
      <div>
        <p class="text-sm text-on-surface-variant">客服热线</p>
        <p class="mt-2 text-2xl font-semibold text-on-surface">{{ support?.phone }}</p>
      </div>
      <div>
        <p class="text-sm text-on-surface-variant">服务时间</p>
        <p class="mt-2 text-base font-medium text-on-surface">{{ support?.serviceHours }}</p>
      </div>
      <a
        :href="`tel:${support?.phone ?? ''}`"
        class="flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-white"
      >
        一键拨打客服
      </a>
    </section>

    <section class="rounded-3xl border border-surface-variant bg-white p-inset-card shadow-soft">
      <h2 class="text-lg font-semibold text-on-surface">当前支持内容</h2>
      <ul class="mt-4 space-y-3 text-sm leading-6 text-on-surface-variant">
        <li>估价与预约回收咨询</li>
        <li>拖车安排与材料确认</li>
        <li>报废回收证明与注销办理进度咨询</li>
      </ul>
    </section>
  </section>

  <MobileBottomNav />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import type { SupportContent } from "@car/shared-types";
import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";
import { getSupport } from "@/services/content";

const support = ref<SupportContent | null>(null);

onMounted(async () => {
  support.value = await getSupport();
});
</script>
