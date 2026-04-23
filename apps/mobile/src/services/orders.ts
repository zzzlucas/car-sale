import type {
  ScrapOrderDetail,
  ScrapOrderSummary,
  ValuationOrderPayload,
  ValuationOrderSubmitResult,
} from "@car/shared-types";
import { requestJson } from "./api";
import { getVisitorHeaders } from "./visitor";

export async function submitValuationOrder(
  payload: ValuationOrderPayload,
): Promise<ValuationOrderSubmitResult> {
  return requestJson<ValuationOrderSubmitResult>("/app/valuation-orders", {
    method: "POST",
    headers: getVisitorHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getOrderDetail(orderId: string): Promise<ScrapOrderDetail> {
  return requestJson<ScrapOrderDetail>(`/app/valuation-orders/${orderId}`, {
    headers: getVisitorHeaders(),
  });
}

export async function getOrderProgress(orderId: string): Promise<ScrapOrderDetail> {
  return requestJson<ScrapOrderDetail>(`/app/valuation-orders/${orderId}/progress`, {
    headers: getVisitorHeaders(),
  });
}

export async function getMyOrders(): Promise<ScrapOrderSummary[]> {
  return requestJson<ScrapOrderSummary[]>("/app/me/valuation-orders", {
    headers: getVisitorHeaders(),
  });
}
