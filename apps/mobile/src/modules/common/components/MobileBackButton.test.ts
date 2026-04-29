import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentSource = fs.readFileSync(path.join(__dirname, "MobileBackButton.vue"), "utf8");
const customerPagesDir = path.resolve(__dirname, "../../customer/pages");
const recordsSource = fs.readFileSync(path.join(customerPagesDir, "CustomerRecordsPage.vue"), "utf8");
const progressSource = fs.readFileSync(path.join(customerPagesDir, "CustomerProgressPage.vue"), "utf8");

describe("MobileBackButton", () => {
  it("uses a quiet native-like icon affordance instead of a bordered pill", () => {
    expect(componentSource).toContain('aria-label="返回上一页"');
    expect(componentSource).toContain("mobile-back-button__chevron");
    expect(componentSource).toContain("h-11 w-11");
    expect(componentSource).toContain("text-on-surface");
    expect(componentSource).toContain("active:bg-surface-container-high");
    expect(componentSource).not.toContain("border border-outline-variant");
    expect(componentSource).not.toContain("返回</span>");
  });

  it("is reused by reservation records and progress detail headers", () => {
    expect(recordsSource).toContain('<MobileBackButton @click="goBack" />');
    expect(progressSource).toContain('<MobileBackButton @click="goBack" />');
    expect(recordsSource).toContain('import MobileBackButton from "@/modules/common/components/MobileBackButton.vue"');
    expect(progressSource).toContain('import MobileBackButton from "@/modules/common/components/MobileBackButton.vue"');
    expect(recordsSource).toContain('class="w-11"');
    expect(progressSource).toContain('class="w-11"');
  });
});
