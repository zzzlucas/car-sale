import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "CustomerMePage.vue"), "utf8");

describe("CustomerMePage footer", () => {
  it("shows a temporary toast when login registration is tapped", () => {
    expect(source).toContain("handleLoginEntryClick");
    expect(source).toContain("该功能暂未设计");
  });

  it("renders the platform copyright year dynamically instead of keeping 2024 hard coded", () => {
    expect(source).toContain("new Date().getFullYear()");
    expect(source).toContain("© {{ currentYear }} 车辆报废回收平台");
    expect(source).not.toContain("© 2024 车辆报废回收平台");
  });
});
