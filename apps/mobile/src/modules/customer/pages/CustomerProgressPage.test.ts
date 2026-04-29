import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const progressSource = fs.readFileSync(path.join(__dirname, "CustomerProgressPage.vue"), "utf8");
const valuationSource = fs.readFileSync(path.join(__dirname, "CustomerValuationPage.vue"), "utf8");

describe("CustomerProgressPage navigation", () => {
  it("offers a clear home exit from the submitted progress detail", () => {
    expect(progressSource).toContain('to="/customer"');
    expect(progressSource).toContain("回到首页");
  });

  it("replaces the form route after submission so browser back does not reopen the submitted form", () => {
    expect(valuationSource).toContain("await router.replace(`/customer/progress/${result.id}`)");
    expect(valuationSource).not.toContain("await router.push(`/customer/progress/${result.id}`)");
  });
});
