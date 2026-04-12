"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import type { GlobeMethods, GlobeProps } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
}) as ForwardRefExoticComponent<GlobeProps & RefAttributes<GlobeMethods>>;

export default function GlobeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });
  const [isLoadingSoil, setIsLoadingSoil] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<{
    lat: number;
    lng: number;
    name: string;
    climate: string;
    soil: string;
    crop: string;
  } | null>(null);

  // stores the pin data for the currently selected region
  const [selectedMarker, setSelectedMarker] = useState<
    { lat: number; lng: number; name: string }[]
  >([]);

  const getRegionInfo = (lat: number, lng: number) => {
    if (lat < -10 && lng > -75 && lng < -30) {
      return {
        name: "Brasil / América do Sul",
        climate: "Tropical a subtropical",
        soil: "Varia conforme a região; áreas férteis para várias culturas",
        crop: "Soja, milho, café e cana",
      };
    }

    if (lat > 35 && lng > -10 && lng < 40) {
      return {
        name: "Europa / Mediterrâneo",
        climate: "Temperado a mediterrâneo",
        soil: "Solo bom para culturas sazonais",
        crop: "Trigo, uva e oliva",
      };
    }

    return {
      name: "Região selecionada",
      climate: "Clima a definir",
      soil: "Solo a analisar",
      crop: "Culturas sugeridas a calcular",
    };
  };

  useEffect(() => {
    const updateSize = () => {
      setGlobeSize({
        width: containerRef.current?.clientWidth ?? 0,
        height: containerRef.current?.clientHeight ?? 0,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current) {
      return;
    }

    const controls = globeRef.current.controls();
    controls.enablePan = false;
    controls.minDistance = 150;
    controls.maxDistance = 360;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    globeRef.current.pointOfView({ lat: 12, lng: -25, altitude: 2.1 }, 0);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-50"
    >
      <Globe
        ref={globeRef}
        width={Math.max(globeSize.width, 1)}
        height={Math.max(globeSize.height, 1)}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/globe_textures/earth_cartoon.jpg"
        atmosphereAltitude={0.5}
        atmosphereColor="#93c5fd"

        // show a single pin for the selected region
        htmlElementsData={selectedMarker}
        htmlLat="lat"
        htmlLng="lng"
        htmlElement={(d) => {
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
              <div style="
                width:18px;
                height:18px;
                border-radius:9999px;
                background:#c52227;
                border:3px solid white;
                box-shadow:0 4px 14px rgba(0,0,0,0.18);
              "></div>
              <div style="
                width:4px;
                height:16px;
                background:#c52227;
                border-radius:9999px;
                margin-top:-2px;
              "></div>
            </div>
          `;
          return el;
        }}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.8}
        pointsMerge={false}

        onGlobeClick={async ({ lat, lng }) => {
          try {
            setIsLoadingSoil(true);

            setSelectedRegion({
              lat,
              lng,
              name: "Região selecionada",
              climate: "Carregando...",
              soil: "Carregando informações do solo...",
              crop: "Calculando...",
            });

            setSelectedMarker([
              {
                lat,
                lng,
                name: "Região selecionada",
              },
            ]);

            globeRef.current?.pointOfView(
              { lat, lng, altitude: 1.4 },
              1000
            );

            const roundedLat = Number(lat.toFixed(3));
            const roundedLng = Number(lng.toFixed(3));

            const response = await fetch(`/api/soil?lat=${roundedLat}&lng=${roundedLng}`);
            const data = await response.json();

            setSelectedRegion({
              lat,
              lng,
              name: "Região selecionada",
              climate: "Clima ainda não integrado",
              soil: data.hasData
                ? data.soilSummary
                : "Sem dados de solo nesse ponto exato. Tente clicar em uma área rural próxima.",
              crop: "Sugestão futura baseada em solo + clima",
            });
          } catch {
            setSelectedRegion({
              lat,
              lng,
              name: "Região selecionada",
              climate: "Clima ainda não integrado",
              soil: "Erro ao consultar o SoilGrids",
              crop: "Sugestão indisponível",
            });
          } finally {
            setIsLoadingSoil(false);
          }
        }}

        onGlobeReady={() => {
          const controls = globeRef.current?.controls();
          if (!controls) return;

          controls.enablePan = false;
          controls.minDistance = 150;
          controls.maxDistance = 360;
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.35;

          globeRef.current?.pointOfView({ lat: 12, lng: -25, altitude: 2.1 }, 0);
        }}

        
      />
      {isLoadingSoil && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="rounded-2xl bg-white/90 px-6 py-4 shadow-xl">
            <p className="text-sm font-semibold text-slate-700 animate-pulse">
              Carregando informações do solo...
            </p>
          </div>
        </div>
      )}


      {selectedRegion && (
        <div className="absolute left-6 top-1/2 z-10 w-72 -translate-y-1/2 rounded-3xl bg-white/90 p-5 shadow-xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-800">
            {selectedRegion.name}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Latitude: {selectedRegion.lat.toFixed(2)}
          </p>
          <p className="text-sm text-slate-600">
            Longitude: {selectedRegion.lng.toFixed(2)}
          </p>

          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Clima</p>
            <p className="text-sm text-slate-600">{selectedRegion.climate}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Solo</p>
            <p className="text-sm text-slate-600">{selectedRegion.soil}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Solo</p>
            {isLoadingSoil ? (
              <p className="text-sm text-slate-500 animate-pulse">
                Carregando informações do solo...
              </p>
            ) : (
              <p className="text-sm text-slate-600">{selectedRegion.soil}</p>
            )}
          </div>

        </div>
      )}

      {selectedRegion && (
        <div className="absolute right-6 top-1/2 z-10 w-72 -translate-y-1/2 rounded-3xl bg-white/90 p-5 shadow-xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-800">
            Sugestões de plantio
          </h2>

          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Próximo passo</p>
            {isLoadingSoil ? (
              <p className="text-sm text-slate-500 animate-pulse">
                Buscando dados para análise...
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Simular produtividade, calendário e necessidade hídrica.
              </p>
            )}
          </div>

          
        </div>
      )}


    </div>
  );
}
