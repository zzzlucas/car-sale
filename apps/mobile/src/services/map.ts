import type { MapAddressSuggestion } from "@car/shared-types";

import { requestJson } from "./api";

export async function searchAddressSuggestions(
  keywords: string,
): Promise<MapAddressSuggestion[]> {
  const normalizedKeywords = keywords.trim();
  if (normalizedKeywords.length < 2) {
    return [];
  }

  return requestJson<MapAddressSuggestion[]>(
    `/app/map/address-suggestions?keywords=${encodeURIComponent(normalizedKeywords)}`,
  );
}
