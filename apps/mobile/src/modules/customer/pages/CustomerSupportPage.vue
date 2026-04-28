<template>
  <main class="flex h-screen flex-col overflow-hidden bg-surface">
    <header class="shrink-0 border-b border-surface-variant bg-white">
      <div class="mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <button
          class="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container"
          @click="goBack"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-lg font-semibold tracking-tight text-primary">AI 客服助手</h1>
        <div class="w-8" />
      </div>
    </header>

    <section
      ref="chatBodyRef"
      class="hide-scrollbar mx-auto flex w-full max-w-md flex-1 flex-col gap-5 overflow-y-auto bg-surface-bright px-margin-page py-stack-lg"
    >
      <div class="flex justify-center">
        <div class="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-label-sm text-primary">
          <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
          智能客服助手，可随时转专业客服
        </div>
      </div>

      <template v-for="message in messages" :key="message.id">
        <div v-if="message.role === 'assistant'" class="flex max-w-[95%] items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
            <span class="material-symbols-outlined icon-fill text-on-primary-container">support_agent</span>
          </div>
          <div class="flex w-full flex-col gap-2">
            <span class="ml-1 text-label-sm text-on-surface-variant">
              {{ message.kind === "welcome" ? "AI 助手" : "AI 助手答复" }}
            </span>
            <div class="rounded-3xl rounded-tl-none bg-white px-4 py-3 shadow-subtle ring-1 ring-surface-variant">
              <p class="text-body-md leading-6 text-on-surface">{{ message.text }}</p>
              <RouterLink
                v-if="message.showInlineProfessionalContact"
                to="/customer/support/contact"
                class="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-label-md font-semibold text-primary transition-colors active:bg-primary/10"
              >
                <span class="material-symbols-outlined text-[16px]">headset_mic</span>
                联系专业客服
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-else class="flex items-start justify-end gap-3">
          <div class="flex max-w-[85%] flex-col items-end gap-1">
            <div class="rounded-3xl rounded-tr-none bg-primary px-4 py-3 text-on-primary shadow-[0_4px_14px_rgba(0,76,76,0.22)]">
              <p class="text-body-md leading-6">{{ message.text }}</p>
            </div>
          </div>
          <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-variant bg-surface-container">
            <span class="material-symbols-outlined icon-fill text-on-surface-variant">person</span>
          </div>
        </div>
      </template>

      <section v-if="showPresetQuestions" class="rounded-[24px] bg-white px-4 py-4 shadow-subtle ring-1 ring-surface-variant">
        <p class="text-label-md text-on-surface-variant">快捷问题</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="item in SUPPORT_PRESET_QUESTIONS"
            :key="item.id"
            type="button"
            class="rounded-full border border-surface-variant bg-surface-container-low px-3 py-2 text-label-md text-on-surface transition-colors active:border-primary active:text-primary"
            @click="sendMessage(item.question)"
          >
            {{ item.label }}
          </button>
        </div>
      </section>
    </section>

    <section
      v-if="showLargeContactCta"
      class="shrink-0 border-t border-surface-variant bg-white/95 px-margin-page py-3 backdrop-blur-sm"
    >
      <div class="mx-auto flex w-full max-w-md items-center justify-between gap-4 rounded-[24px] bg-primary px-4 py-4 text-on-primary shadow-[0_10px_24px_rgba(0,76,76,0.18)]">
        <div class="min-w-0">
          <p class="text-body-md font-semibold">需要更具体的人工协助？</p>
          <p class="mt-1 text-label-md text-primary-fixed">超过三轮仍未解决时，建议直接转专业客服。</p>
        </div>
        <RouterLink
          to="/customer/support/contact"
          class="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-4 py-2 text-label-md font-semibold text-primary"
        >
          联系专业客服
        </RouterLink>
      </div>
    </section>

    <footer class="shrink-0 border-t border-surface-variant bg-surface-container-lowest px-margin-page pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
      <div class="mx-auto flex w-full max-w-md items-center gap-3">
        <RouterLink
          to="/customer/support/contact"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors active:bg-surface-container"
        >
          <span class="material-symbols-outlined">headset_mic</span>
        </RouterLink>
        <div class="flex flex-1 items-center rounded-full border border-transparent bg-surface-container-low px-4 py-2.5 focus-within:border-primary">
          <input
            v-model="draft"
            :disabled="isSending"
            type="text"
            placeholder="请输入您的问题..."
            class="h-6 w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
            @keydown.enter.prevent="sendMessage()"
          />
        </div>
        <button
          :disabled="isSending"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-all active:scale-90 disabled:scale-100 disabled:opacity-60"
          @click="sendMessage()"
        >
          <span class="material-symbols-outlined icon-fill text-[20px]">send</span>
        </button>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";

import {
  SUPPORT_PRESET_QUESTIONS,
  streamSupportAssistantChat,
} from "./supportChat";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
  kind?: "welcome" | "answer";
  showInlineProfessionalContact?: boolean;
};

const router = useRouter();
const draft = ref("");
const isSending = ref(false);
const chatBodyRef = ref<HTMLElement | null>(null);
const conversationId = ref<string | null>(null);
const messages = ref<Message[]>([
  {
    id: "a-welcome",
    role: "assistant",
    kind: "welcome",
    text: "您好，我是 AI 客服助手。您可以先用下方快捷问题了解流程、材料或预约进度；如果问题更复杂，我也会引导您联系专业客服。",
  },
]);

const answeredTurns = computed(
  () => messages.value.filter(item => item.role === "assistant" && item.kind === "answer").length,
);
const showPresetQuestions = computed(() => answeredTurns.value === 0);
const showLargeContactCta = ref(false);

watch(
  () => messages.value.map(item => item.text).join("\n"),
  async () => {
    await nextTick();
    if (!chatBodyRef.value) {
      return;
    }

    chatBodyRef.value.scrollTo({
      top: chatBodyRef.value.scrollHeight,
      behavior: "smooth",
    });
  },
);

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push("/customer/me");
}

function toSupportChatHistory() {
  return messages.value.map(item => ({
    role: item.role,
    content: item.text,
  }));
}

function upsertStreamingAssistantMessage(messageId: string, content: string) {
  const existing = messages.value.find(item => item.id === messageId);
  if (existing) {
    existing.text += content;
    return;
  }

  messages.value.push({
    id: messageId,
    role: "assistant",
    kind: "answer",
    text: content,
  });
}

function finalizeAssistantMessage(messageId: string, text: string, showInlineProfessionalContact: boolean) {
  const existing = messages.value.find(item => item.id === messageId);
  if (existing) {
    existing.text = text;
    existing.showInlineProfessionalContact = showInlineProfessionalContact;
    return;
  }

  messages.value.push({
    id: messageId,
    role: "assistant",
    kind: "answer",
    text,
    showInlineProfessionalContact,
  });
}

async function sendMessage(presetQuestion?: string) {
  const content = (presetQuestion ?? draft.value).trim();
  if (!content || isSending.value) {
    return;
  }

  messages.value.push({
    id: `u-${Date.now()}`,
    role: "user",
    text: content,
  });

  draft.value = "";
  isSending.value = true;

  try {
    const history = toSupportChatHistory();
    const turnCount = history.filter(item => item.role === "user").length;
    const assistantMessageId = `a-${Date.now()}`;
    const result = await streamSupportAssistantChat(
      {
        conversationId: conversationId.value || undefined,
        userMessage: content,
        turnCount,
        history,
      },
      {
        onMeta: event => {
          if (event.conversationId) {
            conversationId.value = event.conversationId;
          }
        },
        onDelta: content => upsertStreamingAssistantMessage(assistantMessageId, content),
      },
    );

    if (result.conversationId) {
      conversationId.value = result.conversationId;
    }

    finalizeAssistantMessage(
      assistantMessageId,
      result.reply,
      result.escalation.showInlineProfessionalContact,
    );
    showLargeContactCta.value = result.escalation.showLargeProfessionalContact;
  } finally {
    isSending.value = false;
  }
}
</script>
