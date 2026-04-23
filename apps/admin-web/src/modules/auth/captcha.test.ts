import { describe, expect, it } from "vitest";

import { resolveCaptchaContent } from "./captcha";

describe("resolveCaptchaContent", () => {
  it("treats data uri captcha payloads as images", () => {
    expect(resolveCaptchaContent("data:image/svg+xml;base64,abc")).toEqual({
      mode: "image",
      value: "data:image/svg+xml;base64,abc",
    });
  });

  it("treats inline svg captcha payloads as html", () => {
    expect(resolveCaptchaContent("<svg viewBox='0 0 10 10'></svg>")).toEqual({
      mode: "html",
      value: "<svg viewBox='0 0 10 10'></svg>",
    });
  });

  it("falls back to plain text for empty or non-image payloads", () => {
    expect(resolveCaptchaContent("点击加载验证码")).toEqual({
      mode: "text",
      value: "点击加载验证码",
    });
    expect(resolveCaptchaContent("")).toEqual({
      mode: "text",
      value: "点击加载验证码",
    });
  });
});
