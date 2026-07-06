export type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
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
      countryCode: null,
      locationLabel: `Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`,
    };
  }

  const cityName = pickCityName(data.address);
  const state = data.address?.state ?? null;
  const country = data.address?.country ?? null;
  const countryCode = data.address?.country_code?.toLowerCase() ?? null;
  const parts = [cityName, state, country].filter(Boolean);

  return {
    cityName,
    state,
    country,
    countryCode,
    locationLabel:
      parts.length > 0
        ? parts.join(", ")
        : (data.display_name ?? `Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`),
  };
}
