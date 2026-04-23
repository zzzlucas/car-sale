import type {
  ValuationPhotoUploadTicketPayload,
  ValuationPhotoUploadTicketResult,
} from "@car/shared-types";

import { requestJson } from "./api";
import { getVisitorHeaders } from "./visitor";

export async function uploadVehiclePhoto(file: File): Promise<string> {
  const ticket = await requestJson<ValuationPhotoUploadTicketResult>(
    "/app/valuation-orders/photos/upload-ticket",
    {
      method: "POST",
      headers: getVisitorHeaders(),
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      } satisfies ValuationPhotoUploadTicketPayload),
    },
  );

  const uploadResponse = await fetch(ticket.uploadUrl, {
    method: ticket.method,
    headers: ticket.headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`上传到 COS 失败: ${uploadResponse.status}`);
  }

  return ticket.objectPointer;
}
