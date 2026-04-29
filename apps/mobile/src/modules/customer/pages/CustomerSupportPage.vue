<template>
  <main class="support-chat-shell fixed inset-x-0 top-0 flex min-h-0 flex-col overflow-hidden bg-surface">
    <header class="mobile-page-header shrink-0 border-b border-surface-variant bg-white">
      <div class="mobile-page-header__bar mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <button
          class="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container"
          @click="goBack"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="mobile-page-header__title text-lg font-semibold tracking-tight text-primary">AI 客服助手</h1>
        <button
          type="button"
          class="restart-button rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-label-md font-semibold text-primary shadow-sm transition-colors active:bg-primary/10 disabled:opacity-40"
          :disabled="isSending"
          @click="restartConversation"
        >
          重新开始
        </button>
      </div>
    </header>

    <section ref="chatBodyRef" class="support-chat-body hide-scrollbar min-h-0 flex-1 overflow-y-auto bg-surface-bright">
      <div class="mx-auto flex min-h-full w-full max-w-md flex-col gap-5 px-margin-page py-stack-lg">
        <div class="flex justify-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-label-sm text-primary">
            <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
            智能客服助手，可随时转一对一客服
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
              <div
                v-if="message.text"
                class="support-markdown text-body-md leading-6 text-on-surface"
                v-html="renderSupportMarkdown(message.text)"
              />
              <div v-else-if="message.isPending" class="typing-indicator flex items-center gap-2 py-1.5 text-label-md text-on-surface-variant">
                <span class="flex items-center gap-1">
                  <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.2s]" />
                  <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.1s]" />
                  <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70" />
                </span>
                正在思考
              </div>
              <RouterLink
                v-if="message.showInlineProfessionalContact"
                to="/customer/support/contact"
                class="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-label-md font-semibold text-primary transition-colors active:bg-primary/10"
              >
                <span class="material-symbols-outlined text-[16px]">headset_mic</span>
                联系一对一客服
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
      </div>
    </section>

    <section
      v-if="showLargeContactCta"
      class="shrink-0 border-t border-surface-variant bg-white/95 px-margin-page py-3 backdrop-blur-sm"
    >
      <div class="mx-auto flex w-full max-w-md items-center justify-between gap-4 rounded-[24px] bg-primary px-4 py-4 text-on-primary shadow-[0_10px_24px_rgba(0,76,76,0.18)]">
        <div class="min-w-0">
          <p class="text-body-md font-semibold">需要更具体的一对一协助？</p>
          <p class="mt-1 text-label-md text-primary-fixed">超过三轮仍未解决时，建议直接转一对一客服。</p>
        </div>
        <RouterLink
          to="/customer/support/contact"
          class="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-4 py-2 text-label-md font-semibold text-primary"
        >
          联系一对一客服
        </RouterLink>
      </div>
    </section>

    <footer class="support-chat-composer shrink-0 border-t border-surface-variant bg-surface-container-lowest px-margin-page pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";

import {
  SUPPORT_PRESET_QUESTIONS,
  streamSupportAssistantChat,
} from "./supportChat";
import {
  clearSupportChatCache,
  readSupportChatCache,
  writeSupportChatCache,
} from "./supportChatStorage";
import { renderSupportMarkdown } from "./supportMarkdown";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
  kind?: "welcome" | "answer";
  isPending?: boolean;
  showInlineProfessionalContact?: boolean;
};

const TYPEWRITER_CHUNK_SIZE = 2;
const TYPEWRITER_DELAY_MS = 18;
const WELCOME_MESSAGE: Message = {
  id: "a-welcome",
  role: "assistant",
  kind: "welcome",
  text: "您好，我是 AI 客服助手。您可以先用下方快捷问题了解流程、材料或预约进度；如果问题更复杂，我也会引导您联系一对一客服。",
};

const router = useRouter();
const draft = ref("");
const isSending = ref(false);
const chatBodyRef = ref<HTMLElement | null>(null);
const conversationId = ref<string | null>(null);
const cachedChat = readSupportChatCache();
const messages = ref<Message[]>(cachedChat?.messages?.length ? cachedChat.messages : [{ ...WELCOME_MESSAGE }]);
let typewriterTimer: ReturnType<typeof window.setTimeout> | null = null;
let typewriterIdleResolver: (() => void) | null = null;
const pendingAssistantText = ref("");
let previousBodyOverflow = "";
let previousHtmlOverflow = "";

function lockSupportChatPageScroll() {
  if (typeof document === "undefined") {
    return;
  }

  previousBodyOverflow = document.body.style.overflow;
  previousHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

function unlockSupportChatPageScroll() {
  if (typeof document === "undefined") {
    return;
  }

  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousHtmlOverflow;
}

onMounted(() => {
  lockSupportChatPageScroll();
});

onBeforeUnmount(() => {
  unlockSupportChatPageScroll();
});

const answeredTurns = computed(
  () => messages.value.filter(item => item.role === "assistant" && item.kind === "answer").length,
);
const showPresetQuestions = computed(() => answeredTurns.value === 0);
const showLargeContactCta = ref(Boolean(cachedChat?.showLargeContactCta));

if (cachedChat?.conversationId) {
  conversationId.value = cachedChat.conversationId;
}

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

watch(
  [messages, conversationId, showLargeContactCta],
  () => {
    writeSupportChatCache({
      conversationId: conversationId.value,
      messages: messages.value
        .filter(item => !item.isPending)
        .map(({ id, role, text, kind, showInlineProfessionalContact }) => ({
          id,
          role,
          text,
          kind,
          showInlineProfessionalContact,
        })),
      showLargeContactCta: showLargeContactCta.value,
    });
  },
  { deep: true },
);

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push("/customer/me");
}

function restartConversation() {
  if (typewriterTimer) {
    window.clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }

  typewriterIdleResolver?.();
  typewriterIdleResolver = null;
  pendingAssistantText.value = "";
  conversationId.value = null;
  showLargeContactCta.value = false;
  messages.value = [{ ...WELCOME_MESSAGE }];
  clearSupportChatCache();
}

function toSupportChatHistory() {
  return messages.value.filter(item => !item.isPending).map(item => ({
    role: item.role,
    content: item.text,
  }));
}

function sleep(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function resolveTypewriterIdleIfNeeded() {
  if (pendingAssistantText.value || typewriterTimer || !typewriterIdleResolver) {
    return;
  }

  typewriterIdleResolver();
  typewriterIdleResolver = null;
}

function scheduleTypewriter(messageId: string) {
  if (typewriterTimer) {
    return;
  }

  typewriterTimer = window.setTimeout(() => {
    typewriterTimer = null;
    const nextChunk = pendingAssistantText.value.slice(0, TYPEWRITER_CHUNK_SIZE);
    pendingAssistantText.value = pendingAssistantText.value.slice(TYPEWRITER_CHUNK_SIZE);
    upsertStreamingAssistantMessage(messageId, nextChunk);

    if (pendingAssistantText.value) {
      scheduleTypewriter(messageId);
      return;
    }

    resolveTypewriterIdleIfNeeded();
  }, TYPEWRITER_DELAY_MS);
}

function waitForTypewriterIdle() {
  if (!pendingAssistantText.value && !typewriterTimer) {
    return Promise.resolve();
  }

  return new Promise<void>(resolve => {
    typewriterIdleResolver = resolve;
  });
}

function queueStreamingAssistantText(messageId: string, content: string) {
  if (!content) {
    return;
  }

  pendingAssistantText.value += content;
  scheduleTypewriter(messageId);
}

function upsertStreamingAssistantMessage(messageId: string, content = "") {
  const existing = messages.value.find(item => item.id === messageId);
  if (existing) {
    existing.isPending = false;
    existing.text += content;
    return;
  }

  messages.value.push({
    id: messageId,
    role: "assistant",
    kind: "answer",
    text: content,
    isPending: !content,
  });
}

function finalizeAssistantMessage(messageId: string, text: string, showInlineProfessionalContact: boolean) {
  const existing = messages.value.find(item => item.id === messageId);
  if (existing) {
    existing.text = text;
    existing.isPending = false;
    existing.showInlineProfessionalContact = showInlineProfessionalContact;
    return;
  }

  messages.value.push({
    id: messageId,
    role: "assistant",
    kind: "answer",
    text,
    isPending: false,
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
    upsertStreamingAssistantMessage(assistantMessageId);
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
        onDelta: content => queueStreamingAssistantText(assistantMessageId, content),
      },
    );
    await waitForTypewriterIdle();
    await sleep(TYPEWRITER_DELAY_MS);

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

<style scoped>
.support-chat-shell {
  bottom: 0;
}

.support-chat-body {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.support-chat-composer {
  position: relative;
  z-index: 10;
}

.support-markdown :deep(p) {
  margin: 0;
  white-space: pre-wrap;
}

.support-markdown :deep(p + p),
.support-markdown :deep(ul + p),
.support-markdown :deep(p + ul) {
  margin-top: 0.5rem;
}

.support-markdown :deep(ul) {
  margin: 0;
  padding-left: 1.1rem;
  list-style: disc;
}

.support-markdown :deep(li + li) {
  margin-top: 0.25rem;
}

.support-markdown :deep(strong) {
  font-weight: 700;
  color: #004c4c;
}

.support-markdown :deep(code) {
  border-radius: 0.45rem;
  background: rgba(0, 76, 76, 0.08);
  padding: 0.08rem 0.35rem;
  color: #004c4c;
  font-size: 0.92em;
}

.support-markdown :deep(a) {
  color: #006a6a;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
