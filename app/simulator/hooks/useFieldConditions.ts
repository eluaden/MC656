"use client";

import { useCallback, useEffect, useState } from "react";
import { FieldConditions } from "../types";

const STORAGE_KEY = "simFieldConditions";

export const DEFAULT_CONDITIONS: FieldConditions = {
  temperature: 24,
  ph: 6,
  source: "manual",
};

function loadSavedConditions(): FieldConditions {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_CONDITIONS;
  try {
    const parsed = JSON.parse(saved) as Partial<FieldConditions>;
    const temperature = Number(parsed.temperature);
    const ph = Number(parsed.ph);
    if (!Number.isFinite(temperature) || !Number.isFinite(ph)) {
      return DEFAULT_CONDITIONS;
    }
    return {
      temperature,
      ph,
      source: parsed.source === "mapa" ? "mapa" : "manual",
      regionLabel:
        typeof parsed.regionLabel === "string" ? parsed.regionLabel : undefined,
    };
  } catch {
    return DEFAULT_CONDITIONS;
  }
}

/**
 * Condições do terreno (temperatura + pH) que alimentam o modelo de
 * crescimento. Se a página for aberta com ?lat=&lng= (vindo do globo),
 * busca as condições reais do ponto em /api/crop e /api/location.
 */
export function useFieldConditions() {
  // Como no useCropGrid: o valor salvo só entra após a montagem para não
  // divergir do HTML do servidor (hydration mismatch).
  const [conditions, setConditions] =
    useState<FieldConditions>(DEFAULT_CONDITIONS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetchingMap, setIsFetchingMap] = useState(false);

  useEffect(() => {
    setConditions(loadSavedConditions());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
    }
  }, [conditions, isLoaded]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = Number(params.get("lat"));
    const lng = Number(params.get("lng"));
    if (!params.has("lat") || Number.isNaN(lat) || Number.isNaN(lng)) return;

    let cancelled = false;
    setIsFetchingMap(true);

    (async () => {
      try {
        const [cropResponse, locationResponse] = await Promise.all([
          fetch(`/api/crop?lat=${lat}&lng=${lng}`),
          fetch(`/api/location?lat=${lat}&lng=${lng}`),
        ]);
        const cropData = await cropResponse.json();
        const locationData = locationResponse.ok
          ? await locationResponse.json()
          : {};
        if (cancelled) return;

        const temperature = cropData?.conditions?.temperature;
        const ph = cropData?.conditions?.ph;
        if (typeof temperature !== "number" && typeof ph !== "number") return;

        setConditions((prev) => ({
          temperature:
            typeof temperature === "number" ? temperature : prev.temperature,
          ph: typeof ph === "number" ? ph : prev.ph,
          source: "mapa",
          regionLabel:
            locationData.locationLabel ??
            locationData.cityName ??
            `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
        }));
      } catch {
        // Sem dados do mapa: mantém as condições manuais.
      } finally {
        if (!cancelled) setIsFetchingMap(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /** Ajuste manual de um dos valores (marca a origem como manual). */
  const adjust = useCallback(
    (changes: Partial<Pick<FieldConditions, "temperature" | "ph">>) => {
      setConditions((prev) => ({
        ...prev,
        ...changes,
        source: "manual",
        regionLabel: undefined,
      }));
    },
    [],
  );

  return { conditions, adjust, isFetchingMap };
}
