import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "CustomerSupportContactPage.vue"), "utf8");

describe("CustomerSupportContactPage", () => {
  it("shows phone, wechat placeholder, and service hours for one-to-one support handoff", () => {
    expect(source).toContain("一对一客服");
    expect(source).toContain("客服电话");
    expect(source).toContain("微信咨询");
    expect(source).toContain("工作时间");
    expect(source).not.toContain("真人客服");
  });
});
