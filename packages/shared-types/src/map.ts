export interface MapAddressSuggestion {
  id: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface MapReverseGeocodeResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
}
