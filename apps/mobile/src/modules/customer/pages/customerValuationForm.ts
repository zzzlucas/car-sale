import type { ValuationOrderPayload } from "@car/shared-types";

export function createInitialValuationForm(): ValuationOrderPayload {
  return {
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
  };
}

export function validateValuationForm(form: ValuationOrderPayload) {
  if (!form.brandModel.trim()) {
    return "请先填写车辆品牌型号。";
  }

  if (!form.contactName.trim()) {
    return "请先填写联系姓名。";
  }

  if (!/^1\d{10}$/.test(form.contactPhone.trim())) {
    return "请填写正确的联系电话。";
  }

  if (!form.pickupAddress.trim()) {
    return "请先填写取车地址。";
  }

  if (!form.vehiclePhotos.length) {
    return "请至少上传 1 张车辆照片。";
  }

  return null;
}
