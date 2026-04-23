<template>
  <main class="login-shell">
    <section class="login-panel">
      <div class="login-panel__brand">
        <p class="login-panel__eyebrow">Cool Admin / 业务后台</p>
        <h1>报废车回收管理后台</h1>
        <p class="login-panel__desc">
          用现有 cool-admin 登录接口直接进入后台，先把订单处理闭环跑通。
        </p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <label class="field">
          <span>账号</span>
          <input v-model.trim="form.username" type="text" autocomplete="username" />
        </label>

        <label class="field">
          <span>密码</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
          />
        </label>

        <div class="field">
          <span>验证码</span>
          <div class="captcha-row">
            <input
              v-model.trim="form.verifyCode"
              type="text"
              inputmode="numeric"
              maxlength="4"
              placeholder="输入验证码"
            />
            <button
              class="captcha-card"
              type="button"
              :disabled="loadingCaptcha"
              @click="refreshCaptcha"
            >
              <span v-if="loadingCaptcha">加载中...</span>
              <img
                v-else-if="captchaContent.mode === 'image'"
                class="captcha-card__image"
                :src="captchaContent.value"
                alt="验证码"
              />
              <span
                v-else-if="captchaContent.mode === 'html'"
                class="captcha-card__markup"
                v-html="captchaContent.value"
              ></span>
              <span v-else class="captcha-card__text">{{ captchaContent.value }}</span>
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="form-message form-message--error">
          {{ errorMessage }}
        </p>
        <p v-else class="form-message">
          开发环境默认账号：`admin` / `123456`
        </p>

        <button class="submit-button" type="submit" :disabled="submitting || loadingCaptcha">
          {{ submitting ? "登录中..." : "登录进入后台" }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { ADMIN_HOME_ROUTE } from "@/app/authGuard";
import { writeAdminSession } from "@/lib/session";
import { resolveCaptchaContent } from "@/modules/auth/captcha";
import { getAdminCaptcha, loginAdmin } from "@/services/adminAuth";

const router = useRouter();

const form = reactive({
  username: import.meta.env.DEV ? "admin" : "",
  password: import.meta.env.DEV ? "123456" : "",
  captchaId: "",
  verifyCode: "",
});

const captchaContent = ref(resolveCaptchaContent());
const loadingCaptcha = ref(false);
const submitting = ref(false);
const errorMessage = ref("");

async function refreshCaptcha() {
  loadingCaptcha.value = true;
  errorMessage.value = "";

  try {
    const ticket = await getAdminCaptcha();
    form.captchaId = ticket.captchaId;
    captchaContent.value = resolveCaptchaContent(ticket.data);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "验证码加载失败，请稍后重试";
  } finally {
    loadingCaptcha.value = false;
  }
}

async function handleSubmit() {
  if (!form.username || !form.password || !form.verifyCode || !form.captchaId) {
    errorMessage.value = "请完整填写账号、密码和验证码";
    if (!form.captchaId) {
      await refreshCaptcha();
    }
    return;
  }

  submitting.value = true;
  errorMessage.value = "";

  try {
    const session = await loginAdmin({
      username: form.username,
      password: form.password,
      captchaId: form.captchaId,
      verifyCode: form.verifyCode,
    });

    writeAdminSession(session);
    await router.replace(ADMIN_HOME_ROUTE);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "登录失败，请检查账号密码和验证码";
    form.verifyCode = "";
    await refreshCaptcha();
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void refreshCaptcha();
});
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.14), transparent 32%),
    linear-gradient(135deg, #f6fbfc 0%, #edf4f6 50%, #f7f7f2 100%);
}

.login-panel {
  width: min(100%, 980px);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 420px);
  gap: 24px;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 28px 64px -40px rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(16px);
}

.login-panel__brand {
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(145deg, #0f766e 0%, #155e75 100%);
  color: #f8fafc;
}

.login-panel__eyebrow {
  margin: 0 0 14px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(240, 253, 250, 0.78);
}

.login-panel__brand h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.05;
}

.login-panel__desc {
  margin: 16px 0 0;
  max-width: 34ch;
  color: rgba(240, 253, 250, 0.82);
}

.login-form {
  display: grid;
  gap: 18px;
  align-content: center;
}

.field {
  display: grid;
  gap: 10px;
}

.field span {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.field input {
  height: 48px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.92);
  font: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus {
  outline: none;
  border-color: #0f766e;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.14);
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 148px;
  gap: 12px;
}

.captcha-card {
  display: grid;
  place-items: center;
  padding: 0 12px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
}

.captcha-card__image {
  display: block;
  width: 100%;
  max-width: 132px;
  height: 40px;
  object-fit: contain;
}

.captcha-card__markup,
.captcha-card__text {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 40px;
}

.captcha-card:disabled {
  cursor: wait;
  opacity: 0.7;
}

.form-message {
  min-height: 20px;
  margin: 0;
  font-size: 13px;
  color: #475569;
}

.form-message--error {
  color: #b91c1c;
}

.submit-button {
  height: 50px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #0f766e 0%, #155e75 100%);
  color: #f8fafc;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 18px 34px -18px rgba(15, 118, 110, 0.52);
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

@media (max-width: 860px) {
  .login-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .login-shell {
    padding: 16px;
  }

  .login-panel {
    padding: 18px;
    border-radius: 22px;
  }

  .captcha-row {
    grid-template-columns: 1fr;
  }
}
</style>
