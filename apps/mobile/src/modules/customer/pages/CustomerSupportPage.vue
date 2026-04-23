<template>
  <main class="flex h-screen flex-col overflow-hidden bg-surface">
    <header class="shrink-0 border-b border-surface-variant bg-white">
      <div class="mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <button class="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container" @click="goBack">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-lg font-semibold tracking-tight text-primary">在线客服</h1>
        <div class="w-8" />
      </div>
    </header>

    <section class="hide-scrollbar mx-auto flex w-full max-w-md flex-1 flex-col gap-stack-lg overflow-y-auto bg-surface-bright p-margin-page">
      <div class="flex justify-center">
        <span class="rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">10:42 AM</span>
      </div>

      <div class="flex justify-center">
        <div class="flex items-center gap-2 rounded-lg border border-surface-variant bg-surface-container-low px-3 py-1.5">
          <span class="material-symbols-outlined icon-fill text-[14px] text-primary">shield</span>
          <span class="text-label-sm text-on-surface-variant">官方客服，全程信息加密保护</span>
        </div>
      </div>

      <template v-for="message in messages" :key="message.id">
        <div v-if="message.role === 'assistant'" class="flex max-w-[95%] items-start gap-stack-sm">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
            <span class="material-symbols-outlined icon-fill text-on-primary-container">support_agent</span>
          </div>
          <div class="flex w-full flex-col gap-1">
            <span class="ml-1 text-label-sm text-on-surface-variant">官方客服 001</span>
            <div class="rounded-2xl rounded-tl-none border border-surface-variant bg-white p-inset-card shadow-subtle">
              <p v-if="message.text" class="text-body-md text-on-surface">{{ message.text }}</p>

              <div v-if="message.steps" class="mt-3 flex flex-col gap-3 rounded-xl border border-surface-variant bg-surface-container-low p-3">
                <div v-for="(step, index) in message.steps" :key="step.title" class="flex items-start gap-3">
                  <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-label-sm text-white">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <h4 class="text-label-md font-bold text-on-surface">{{ step.title }}</h4>
                    <p class="mt-1 text-[13px] leading-tight text-on-surface-variant">{{ step.desc }}</p>
                  </div>
                </div>
              </div>

              <RouterLink
                v-if="message.cta"
                :to="message.cta.to"
                class="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-md text-on-primary-container"
              >
                <span class="material-symbols-outlined text-[18px]">calendar_add_on</span>
                {{ message.cta.label }}
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-else class="flex items-start justify-end gap-stack-sm">
          <div class="flex max-w-[85%] flex-col items-end gap-1">
            <div class="rounded-2xl rounded-tr-none bg-primary p-inset-card text-on-primary shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <p class="text-body-md">{{ message.text }}</p>
            </div>
          </div>
          <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-variant bg-surface-container">
            <span class="material-symbols-outlined icon-fill text-on-surface-variant">person</span>
          </div>
        </div>
      </template>
    </section>

    <footer class="shrink-0 border-t border-surface-variant bg-surface-container-lowest px-margin-page pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
      <div class="mx-auto flex w-full max-w-md items-center gap-3">
        <a :href="`tel:${supportPhone}`" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors active:bg-surface-container">
          <span class="material-symbols-outlined">call</span>
        </a>
        <div class="flex flex-1 items-center rounded-full border border-transparent bg-surface-container-low px-4 py-2.5 focus-within:border-primary">
          <input
            v-model="draft"
            type="text"
            placeholder="请输入您的问题..."
            class="h-6 w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
            @keydown.enter.prevent="sendMessage"
          />
        </div>
        <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-all active:scale-90" @click="sendMessage">
          <span class="material-symbols-outlined icon-fill text-[20px]">send</span>
        </button>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();
const supportPhone = "400-800-8899";
const draft = ref("");

type Message = {
  id: string;
  role: "assistant" | "user";
  text?: string;
  steps?: Array<{ title: string; desc: string }>;
  cta?: { to: string; label: string };
};

const messages = ref<Message[]>([
  {
    id: "a1",
    role: "assistant",
    text: "您好！我是车辆报废回收官方在线客服。很高兴为您服务，请问有什么我可以帮您？",
  },
  {
    id: "u1",
    role: "user",
    text: "我想了解私家车报废流程",
  },
  {
    id: "a2",
    role: "assistant",
    text: "为您整理了私家车报废的标准流程，主要分为以下三个核心步骤：",
    steps: [
      { title: "准备材料", desc: "请准备好机动车登记证书原件、行驶证原件、车主身份证复印件。" },
      { title: "交售车辆", desc: "将待报废车辆交售至我们官方指定的回收拆解网点，或预约免费上门拖车。" },
      { title: "开具证明与注销", desc: "车辆解体后，为您出具《报废机动车回收证明》，并协助办理车辆注销登记。" },
    ],
    cta: { to: "/customer/valuation", label: "预约免费上门拖车" },
  },
]);

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/customer/me");
}

function sendMessage() {
  const content = draft.value.trim();
  if (!content) return;

  messages.value.push({
    id: `u-${Date.now()}`,
    role: "user",
    text: content,
  });

  messages.value.push({
    id: `a-${Date.now()}`,
    role: "assistant",
    text: content.includes("进度")
      ? "您可以直接前往“预约记录”或“报废进度”页面查看当前业务状态；如果告诉我订单号，我也可以继续为您说明。"
      : "已收到您的问题。当前是演示客服界面，您可以继续输入问题，或直接点击下方预约入口开始估价。",
  });

  draft.value = "";
}
</script>
