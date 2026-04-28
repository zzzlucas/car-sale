import { describe, expect, it } from "vitest";

import {
  buildBrandModelValue,
  findInitialVehicleBrandId,
  getVehicleBrandCatalog,
  getVehicleCatalogStats,
  searchVehicleModels,
} from "./vehicleBrandCatalog";

describe("vehicle brand catalog", () => {
  it("keeps common old scrap-car series searchable", () => {
    const suggestions = searchVehicleModels("car", "桑塔纳");

    expect(suggestions[0]).toMatchObject({
      brandName: "大众",
      modelName: "桑塔纳",
      value: "大众 桑塔纳",
    });
  });

  it("supports compact user input without spaces between brand and model", () => {
    const suggestions = searchVehicleModels("car", "丰田凯美瑞");

    expect(suggestions.map(item => item.value)).toContain("丰田 凯美瑞");
  });

  it("prioritizes practical commercial vehicles when truck type is selected", () => {
    const catalog = getVehicleBrandCatalog("truck");
    const suggestions = searchVehicleModels("truck", "东风小康");

    expect(catalog[0]?.name).toBe("五菱汽车");
    expect(suggestions.map(item => item.value)).toContain("东风小康 K07");
  });

  it("includes common motorcycle brands and legacy scooter models", () => {
    const suggestions = searchVehicleModels("motorcycle", "豪爵铃木");

    expect(suggestions.map(item => item.value)).toContain("豪爵铃木 GN125");
  });

  it("can infer the brand column from a partially completed brand-model value", () => {
    const brandId = findInitialVehicleBrandId("奇瑞 QQ 0.8L", "car");
    const brand = getVehicleBrandCatalog("car").find(item => item.id === brandId);

    expect(brand?.name).toBe("奇瑞");
  });

  it("reports enough catalog depth for a bottom-sheet selector", () => {
    const stats = getVehicleCatalogStats("car");

    expect(stats.brandCount).toBeGreaterThan(100);
    expect(stats.modelCount).toBeGreaterThan(1000);
  });

  it("builds the submitted value from selected brand and model", () => {
    expect(buildBrandModelValue("大众", "捷达")).toBe("大众 捷达");
  });
});
