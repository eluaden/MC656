"use client";

import { useCallback, useEffect, useState } from "react";
import { FieldConditions } from "../types";
import { usePersistedState } from "../../lib/state/usePersistedState";
import { ANON_STATE_KEYS } from "../../lib/state/anonState";

export const DEFAULT_CONDITIONS: FieldConditions = {
  temperature: 24,
  ph: 6,
  source: "manual",
};

/** Normaliza as condições persistidas (do servidor ou do localStorage). */
function normalizeConditions(raw: unknown): FieldConditions {
  if (!raw || typeof raw !== "object") return DEFAULT_CONDITIONS;
  const parsed = raw as Partial<FieldConditions>;
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
}

/**
 * Condições do terreno (temperatura + pH) que alimentam o modelo de
 * crescimento. Se a página for aberta com ?lat=&lng= (vindo do globo),
 * busca as condições reais do ponto em /api/crop e /api/location.
 */
export function useFieldConditions() {
  // Persistência por usuário (servidor) ou localStorage (anônimo). O valor
  // carregado só entra após a montagem — evita hydration mismatch.
  const {
    state: conditions,
    setState: setConditions,
    isLoaded,
  } = usePersistedState<FieldConditions>({
    namespace: "fieldConditions",
    anonKey: ANON_STATE_KEYS.fieldConditions,
    defaultState: DEFAULT_CONDITIONS,
    normalize: normalizeConditions,
  });
  const [isFetchingMap, setIsFetchingMap] = useState(false);

  // Só busca as condições do mapa APÓS a carga inicial, para que a navegação
  // vinda do globo (?lat=&lng=) sobrescreva de forma determinística o valor
  // carregado — e persista pelo save normal.
  useEffect(() => {
    if (!isLoaded) return;

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
  }, [isLoaded, setConditions]);

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
    [setConditions],
  );

  return { conditions, adjust, isFetchingMap };
}
