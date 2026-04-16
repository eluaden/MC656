"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import * as THREE from "three";
import type { GlobeMethods, GlobeProps } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
}) as ForwardRefExoticComponent<GlobeProps & RefAttributes<GlobeMethods>>;

export default function GlobeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });
  const [isLoadingSoil, setIsLoadingSoil] = useState(false);
  const globeMaterialRef = useRef<THREE.MeshPhongMaterial | null>(null);

  if (!globeMaterialRef.current && typeof window !== "undefined") {
    const material = new THREE.MeshPhongMaterial();
    material.bumpScale = 4;
    new THREE.TextureLoader().load(
      "/globe_textures/earth-water.png",
      (texture) => {
        material.specularMap = texture;
        material.specular = new THREE.Color(0x333333);
        material.shininess = 8;
      }
    );
    globeMaterialRef.current = material;
  }
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

  return (
    <div
      ref={containerRef}
      className="starry-bg relative h-screen w-screen overflow-hidden"
    >
      <div className={`relative z-[1] transition-transform duration-700 ease-out ${selectedRegion ? "translate-x-[15%]" : ""}`}>
      <Globe
        ref={globeRef}
        width={Math.max(globeSize.width, 1)}
        height={Math.max(globeSize.height, 1)}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/globe_textures/earth-21k.jpg"
        bumpImageUrl="/globe_textures/earth-topology.png"
        globeMaterial={globeMaterialRef.current ?? undefined}
        atmosphereAltitude={0.15}
        atmosphereColor="#4da6ff"
        // show a single pin for the selected region
        htmlElementsData={selectedMarker}
        htmlLat="lat"
        htmlLng="lng"
        htmlElement={() => {
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; transform:translate(0%, -50%);">
              <div style="
                width:18px;
                height:18px;
                border-radius:9999px;
                background:#10b981;
                border:3px solid white;
                box-shadow:0 0 10px rgba(16,185,129,0.5), 0 4px 14px rgba(0,0,0,0.18);
              "></div>
              <div style="
                width:3px;
                height:14px;
                background:#10b981;
                border-radius:9999px;
                margin-top:0px;
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

            globeRef.current?.pointOfView({ lat, lng }, 1000);

            const roundedLat = Number(lat.toFixed(3));
            const roundedLng = Number(lng.toFixed(3));

            const [soilResponse, weatherResponse, locationResponse] =
              await Promise.all([
                fetch(`/api/soil?lat=${roundedLat}&lng=${roundedLng}`),
                fetch(`/api/weather?lat=${roundedLat}&lng=${roundedLng}`),
                fetch(`/api/location?lat=${roundedLat}&lng=${roundedLng}`),
              ]);

            const soilData = await soilResponse.json();
            const weatherData = await weatherResponse.json();
            const locationData = await locationResponse.json();

            const locationName =
              locationData.locationLabel ??
              locationData.cityName ??
              "Região selecionada";

            setSelectedMarker([
              {
                lat,
                lng,
                name: locationName,
              },
            ]);

            setSelectedRegion({
              lat,
              lng,
              name: locationName,
              climate: weatherData.ok
                ? weatherData.climateSummary
                : "Não foi possível carregar o clima.",
              soil: soilData.hasData
                ? soilData.soilSummary
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
          controls.autoRotate = false;
          controls.autoRotateSpeed = 0.35;

          const directionalLight = globeRef.current
            ?.lights()
            .find((obj3d: THREE.Object3D) => obj3d.type === "DirectionalLight") as THREE.DirectionalLight | undefined;
          if (directionalLight) {
            directionalLight.position.set(1, 1, 1);
          }

          globeRef.current?.pointOfView(
            { lat: 12, lng: -25, altitude: 1.5 },
            0,
          );
        }}
      />
      </div>
      {isLoadingSoil && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-gray-900/90 border border-gray-700/50 px-6 py-4 shadow-xl">
            <p className="text-sm font-semibold text-emerald-400 animate-pulse">
              Carregando informações do solo...
            </p>
          </div>
        </div>
      )}

      {selectedRegion && (
        <div className="panel-slide-in absolute left-5 inset-y-0 z-10 w-80 my-auto h-fit max-h-[calc(100vh-2.5rem)] overflow-y-auto rounded-2xl border border-white/[0.08] bg-black/60 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white leading-tight">
                  {selectedRegion.name}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">({selectedRegion.lat.toFixed(3)}, {selectedRegion.lng.toFixed(3)})</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedRegion(null); setSelectedMarker([]); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/15">
                  <svg className="h-3 w-3 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                </div>
                <p className="text-xs font-semibold text-sky-400 uppercase tracking-wide">Clima</p>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{selectedRegion.climate}</p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15">
                  <svg className="h-3 w-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                </div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Solo</p>
              </div>
              {isLoadingSoil ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
                  <p className="text-sm text-gray-400">Analisando solo...</p>
                </div>
              ) : (
                <p className="text-sm text-gray-300 leading-relaxed">{selectedRegion.soil}</p>
              )}
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15">
                  <svg className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Sugestões de plantio</p>
              </div>
              {isLoadingSoil ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
                  <p className="text-sm text-gray-400">Buscando dados...</p>
                </div>
              ) : (
                <p className="text-sm text-gray-300 leading-relaxed">
                  Integração em breve — sugestões baseadas em solo e clima.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
