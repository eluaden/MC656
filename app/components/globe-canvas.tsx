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
      className="h-screen w-screen overflow-hidden bg-slate-950"
    >
      <Globe
        ref={globeRef}
        width={Math.max(globeSize.width, 1)}
        height={Math.max(globeSize.height, 1)}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
      />
    </div>
  );
}
