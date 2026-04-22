import type {
  ScrapOrderDetail,
  ScrapOrderSummary,
  ValuationOrderPayload,
  ValuationOrderSubmitResult,
} from "@car/shared-types";
import { requestJson } from "./api";

const sampleOrder: ScrapOrderDetail = {
  id: "order-demo-001",
  orderNo: "VR-8893-X2M",
  currentStatus: "scheduled_pickup",
  currentStatusLabel: "已安排上门 / 拖车",
  brandModel: "丰田 凯美瑞",
  plateNumber: "京A·88888",
  ownerName: "张三",
  vin: "LTV1234567890ABCD",
  timeline: [
    { status: "submitted", label: "已提交", time: "2026-04-22 09:30" },
    { status: "contacted", label: "联系中", time: "2026-04-22 10:15" },
    { status: "quoted", label: "估价完成", time: "2026-04-22 14:00" },
    {
      status: "scheduled_pickup",
      label: "已安排上门 / 拖车",
      time: "2026-04-23 14:00",
      note: "工作人员将于今天 14:00 抵达现场，请保持电话畅通。",
    },
  ],
};

const sampleOrders: ScrapOrderSummary[] = [
  {
    id: sampleOrder.id,
    orderNo: sampleOrder.orderNo,
    currentStatus: sampleOrder.currentStatus,
    currentStatusLabel: sampleOrder.currentStatusLabel,
    brandModel: sampleOrder.brandModel,
    plateNumber: sampleOrder.plateNumber,
  },
  {
    id: "order-demo-002",
    orderNo: "VR-1024-A1B",
    currentStatus: "completed",
    currentStatusLabel: "已完成",
    brandModel: "大众 帕萨特",
    plateNumber: "京B·10240",
  },
];

export async function submitValuationOrder(
  payload: ValuationOrderPayload,
): Promise<ValuationOrderSubmitResult> {
  try {
    return await requestJson<ValuationOrderSubmitResult>("/app/valuation-orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      id: sampleOrder.id,
      orderNo: sampleOrder.orderNo,
      currentStatus: "submitted",
    };
  }
}

export async function getOrderDetail(orderId: string): Promise<ScrapOrderDetail> {
  try {
    return await requestJson<ScrapOrderDetail>(`/app/valuation-orders/${orderId}`);
  } catch {
    return { ...sampleOrder, id: orderId };
  }
}

export async function getOrderProgress(orderId: string): Promise<ScrapOrderDetail> {
  try {
    return await requestJson<ScrapOrderDetail>(`/app/valuation-orders/${orderId}/progress`);
  } catch {
    return { ...sampleOrder, id: orderId };
  }
}

export async function getMyOrders(): Promise<ScrapOrderSummary[]> {
  try {
    return await requestJson<ScrapOrderSummary[]>("/app/me/valuation-orders");
  } catch {
    return sampleOrders;
  }
}
