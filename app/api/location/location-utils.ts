export type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
};

export type NominatimResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

export function pickCityName(address?: NominatimAddress | null) {
  if (!address) {
    return null;
  }

  return (
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    null
  );
}

export function buildLocationPayload(
  data: NominatimResponse | null,
  lat: number,
  lng: number,
) {
  if (!data) {
    return {
      cityName: null,
      state: null,
      country: null,
      locationLabel: `Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`,
    };
  }

  const cityName = pickCityName(data.address);
  const state = data.address?.state ?? null;
  const country = data.address?.country ?? null;
  const parts = [cityName, state, country].filter(Boolean);

  return {
    cityName,
    state,
    country,
    locationLabel:
      parts.length > 0
        ? parts.join(", ")
        : (data.display_name ?? `Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`),
  };
}
