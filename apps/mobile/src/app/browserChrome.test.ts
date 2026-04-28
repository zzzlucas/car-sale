import { describe, expect, it } from "vitest";

import { isSocialWebView } from "./browserChrome";

describe("social webview chrome detection", () => {
  it("detects WeChat and QQ in-app browsers", () => {
    expect(
      isSocialWebView(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 MicroMessenger/8.0.49",
      ),
    ).toBe(true);

    expect(
      isSocialWebView(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 QQ/9.0.20.1234",
      ),
    ).toBe(true);
  });

  it("keeps regular mobile browsers in the normal layout", () => {
    expect(
      isSocialWebView(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
  });
});
