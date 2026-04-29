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
  it("uses a labeled compact affordance instead of a floating icon-only arrow", () => {
    expect(componentSource).toContain('aria-label="返回上一页"');
    expect(componentSource).toContain("chevron_left");
    expect(componentSource).toContain("返回");
    expect(componentSource).toContain("min-w-[4.75rem]");
    expect(componentSource).toContain("active:scale-[0.98]");
  });

  it("is reused by reservation records and progress detail headers", () => {
    expect(recordsSource).toContain('<MobileBackButton @click="goBack" />');
    expect(progressSource).toContain('<MobileBackButton @click="goBack" />');
    expect(recordsSource).toContain('import MobileBackButton from "@/modules/common/components/MobileBackButton.vue"');
    expect(progressSource).toContain('import MobileBackButton from "@/modules/common/components/MobileBackButton.vue"');
    expect(recordsSource).toContain('class="w-[4.75rem]"');
    expect(progressSource).toContain('class="w-[4.75rem]"');
  });
});
