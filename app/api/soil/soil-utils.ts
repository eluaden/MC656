export type SoilLayer = {
  name?: string;
  depths?: Array<{
    label?: string;
    values?: {
      mean?: number | null;
    };
  }>;
};

export type SoilResponse = {
  properties?: {
    layers?: SoilLayer[];
  };
};

export function getLayerMean(data: SoilResponse, layerName: string) {
  const layer = data?.properties?.layers?.find((l) => l.name === layerName);
  return layer?.depths?.[0]?.values?.mean ?? null;
}

export function hasUsefulSoilData(data: SoilResponse) {
  const clay = getLayerMean(data, "clay");
  const sand = getLayerMean(data, "sand");
  const silt = getLayerMean(data, "silt");
  const ph = getLayerMean(data, "phh2o");
  const soc = getLayerMean(data, "soc");

  return [clay, sand, silt, ph, soc].some((v) => v !== null && v !== undefined);
}

export function buildSoilSummary(data: SoilResponse) {
  const clay = getLayerMean(data, "clay");
  const sand = getLayerMean(data, "sand");
  const silt = getLayerMean(data, "silt");
  const ph = getLayerMean(data, "phh2o");
  const soc = getLayerMean(data, "soc");

  const parts: string[] = [];

  if (ph !== null) parts.push(`pH aproximado: ${ph / 10}`);
  if (clay !== null) parts.push(`Argila: ${clay / 10}%`);
  if (sand !== null) parts.push(`Areia: ${sand / 10}%`);
  if (silt !== null) parts.push(`Silte: ${silt / 10}%`);
  if (soc !== null) parts.push(`Carbono orgânico: ${soc / 10} g/kg`);

  return {
    clay,
    sand,
    silt,
    ph,
    organicCarbon: soc,
    soilSummary:
      parts.length > 0
        ? parts.join(" | ")
        : "Sem dados de solo nesse ponto exato.",
  };
}
