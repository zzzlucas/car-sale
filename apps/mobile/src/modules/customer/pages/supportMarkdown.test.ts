import { describe, expect, it } from "vitest";

import { renderSupportMarkdown } from "./supportMarkdown";

describe("support markdown renderer", () => {
  it("renders basic markdown safely for AI support answers", () => {
    const html = renderSupportMarkdown(
      "您好，您可以准备：\n- **身份证**\n- 行驶证\n\n详情见 [预约记录](/customer/orders)。<script>alert(1)</script>",
    );

    expect(html).toContain("<ul>");
    expect(html).toContain("<strong>身份证</strong>");
    expect(html).toContain('<a href="/customer/orders"');
    expect(html).not.toContain("<script>");
  });
});
