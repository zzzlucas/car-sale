<template>
  <main class="min-h-screen bg-surface">
    <header class="mobile-page-header sticky top-0 z-20 border-b border-surface-variant bg-white">
      <div class="mobile-page-header__bar mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <button
          class="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container"
          @click="goBack"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="mobile-page-header__title text-lg font-semibold tracking-tight text-primary">一对一客服</h1>
        <div class="w-8" />
      </div>
    </header>

    <section class="mx-auto flex w-full max-w-md flex-col gap-6 px-margin-page py-stack-lg">
      <div class="rounded-[28px] border border-primary/10 bg-[linear-gradient(180deg,rgba(0,76,76,0.08),rgba(255,255,255,0.96))] px-5 py-6">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-label-sm text-primary">
          <span class="material-symbols-outlined text-[16px]">support_agent</span>
          一对一人工支持
        </div>
        <h2 class="mt-4 text-headline-md text-on-surface">需要更具体的协助时，可以直接联系一对一客服。</h2>
        <p class="mt-2 text-body-md text-on-surface-variant">
          适用于订单异常、资料补充、报价争议、拖车时间协调等需要人工跟进的情况。
        </p>
      </div>

      <section class="border-b border-surface-variant pb-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-label-md text-on-surface-variant">客服电话</p>
            <p class="mt-2 text-headline-md text-on-surface">{{ supportPhone }}</p>
            <p class="mt-2 text-body-md text-on-surface-variant">建议在工作时间内拨打，沟通会更顺畅。</p>
          </div>
          <a
            :href="`tel:${supportPhone}`"
            class="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary shadow-sm"
          >
            立即拨打
          </a>
        </div>
      </section>

      <section class="border-b border-surface-variant pb-5">
        <div class="flex items-start gap-4">
          <div class="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-low text-center text-label-sm text-on-surface-variant">
            微信二维码
            <br />
            占位
          </div>
          <div class="min-w-0">
            <p class="text-label-md text-on-surface-variant">微信咨询</p>
            <p class="mt-2 text-body-lg font-semibold text-on-surface">{{ wechatId }}</p>
            <p class="mt-2 text-body-md text-on-surface-variant">
              当前先放演示占位，后续接入真实客服后可替换成二维码和正式微信号。
            </p>
          </div>
        </div>
      </section>

      <section>
        <p class="text-label-md text-on-surface-variant">工作时间</p>
        <div class="mt-3 flex flex-col gap-3">
          <div
            v-for="item in serviceHours"
            :key="item"
            class="flex items-start gap-3 rounded-2xl bg-white px-4 py-4 shadow-subtle ring-1 ring-surface-variant"
          >
            <span class="material-symbols-outlined mt-0.5 text-[18px] text-primary">schedule</span>
            <p class="text-body-md text-on-surface">{{ item }}</p>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

import { PROFESSIONAL_SUPPORT_CONTACT } from "./supportChat";

const router = useRouter();
const supportPhone = PROFESSIONAL_SUPPORT_CONTACT.phone;
const wechatId = PROFESSIONAL_SUPPORT_CONTACT.wechatId;
const serviceHours = PROFESSIONAL_SUPPORT_CONTACT.serviceHours;

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push("/customer/support");
}
</script>
