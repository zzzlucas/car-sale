export interface CaptchaContent {
  mode: "image" | "html" | "text";
  value: string;
}

const DEFAULT_CAPTCHA_TEXT = "点击加载验证码";

export function resolveCaptchaContent(payload?: string | null): CaptchaContent {
  const value = payload?.trim();

  if (!value) {
    return {
      mode: "text",
      value: DEFAULT_CAPTCHA_TEXT,
    };
  }

  if (value.startsWith("data:image/")) {
    return {
      mode: "image",
      value,
    };
  }

  if (value.startsWith("<svg")) {
    return {
      mode: "html",
      value,
    };
  }

  return {
    mode: "text",
    value,
  };
}
