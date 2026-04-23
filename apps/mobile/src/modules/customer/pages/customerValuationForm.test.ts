import { describe, expect, it } from "vitest";

import { createInitialValuationForm, validateValuationForm } from "./customerValuationForm";

describe("customer valuation form helpers", () => {
  it("creates a complete default form object for the reservation flow", () => {
    expect(createInitialValuationForm()).toMatchObject({
      vehicleType: "car",
      brandModel: "",
      plateNumber: "",
      plateRetention: true,
      wheelMaterial: "",
      weightTons: null,
      contactName: "",
      contactPhone: "",
      pickupAddress: "",
      pickupLatitude: null,
      pickupLongitude: null,
      vehiclePhotos: [],
    });
  });

  it("requires contact, address, and photo fields before submission", () => {
    expect(
      validateValuationForm({
        ...createInitialValuationForm(),
        brandModel: "丰田 凯美瑞",
      }),
    ).toBe("请先填写联系姓名。");

    expect(
      validateValuationForm({
        ...createInitialValuationForm(),
        brandModel: "丰田 凯美瑞",
        contactName: "张三",
        contactPhone: "13800138000",
      }),
    ).toBe("请先填写取车地址。");

    expect(
      validateValuationForm({
        ...createInitialValuationForm(),
        brandModel: "丰田 凯美瑞",
        contactName: "张三",
        contactPhone: "13800138000",
        pickupAddress: "深圳南山",
      }),
    ).toBe("请至少上传 1 张车辆照片。");
  });
});
