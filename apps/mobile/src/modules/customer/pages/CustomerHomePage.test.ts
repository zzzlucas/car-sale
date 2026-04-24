import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "CustomerHomePage.vue"), "utf8");

describe("CustomerHomePage landing layout", () => {
  it("removes the legacy fixed header and inline plate input", () => {
    expect(source).not.toContain('fixed left-0 right-0 top-0');
    expect(source).not.toContain("输入车牌号");
    expect(source).not.toContain('v-model="plateNumber"');
  });

  it("keeps the homepage as a single-cta landing page with support entry", () => {
    expect(source).toContain('to="/customer/valuation"');
    expect(source).toContain("立即估价 / 预约回收");
    expect(source).toContain("常见问题");
    expect(source).toContain("联系客服");
  });

  it("uses only the brand image as a restrained homepage visual", () => {
    expect(source).toContain("homeBrandImage");
    expect(source).toContain("brand-mark.png");
    expect(source).not.toContain("homeHeroImage");
    expect(source).not.toContain("homeFlowImage");
    expect(source).not.toContain("homeTrustImage");
  });

  it("keeps the branded hero compact on mobile", () => {
    expect(source).toContain("pt-[calc(env(safe-area-inset-top)+14px)]");
    expect(source).toContain("pb-8");
    expect(source).toContain("mb-4 flex items-center justify-between");
    expect(source).toContain("w-[164px] max-w-[54vw]");
    expect(source).toContain("px-5 py-6");
    expect(source).toContain("px-margin-page pt-8 pb-stack-lg");
  });
});
