import { describe, expect, it } from "vitest";

import {
  SUPPORT_PRESET_QUESTIONS,
  buildAssistantReply,
  shouldShowFullProfessionalContact,
  shouldShowInlineProfessionalContact,
} from "./supportChat";

describe("supportChat demo logic", () => {
  it("provides exactly three preset quick questions for first-entry guidance", () => {
    expect(SUPPORT_PRESET_QUESTIONS).toHaveLength(3);
  });

  it("answers progress questions by directing users back to reservation records", () => {
    expect(buildAssistantReply("怎么查看预约进度？")).toContain("预约记录");
  });

  it("shows the small professional-support handoff after the first answered turn", () => {
    expect(shouldShowInlineProfessionalContact(0)).toBe(false);
    expect(shouldShowInlineProfessionalContact(1)).toBe(true);
  });

  it("shows the large professional-support handoff only after more than three answered turns", () => {
    expect(shouldShowFullProfessionalContact(3)).toBe(false);
    expect(shouldShowFullProfessionalContact(4)).toBe(true);
  });
});
