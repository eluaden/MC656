"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getCrop } from "../data/crops";
import {
  cropSuitability,
  growthProgress,
  growthStage,
} from "../logic/growth";
import {
  computePlantInstance,
  createPlantInstance,
  PlantPartName,
} from "../logic/plantModels";
import { CellState, FieldConditions } from "../types";

type FieldCanvasProps = {
  rows: number;
  cols: number;
  cells: (CellState | null)[];
  day: number;
  conditions: FieldConditions;
  /** Chamada ao clicar/arrastar sobre uma célula (pintura). */
  onPaintCell: (index: number) => void;
  /** Célula sob o cursor (ou null), para o painel de detalhes. */
  onHoverCell: (index: number | null) => void;
};

// Paleta do terreno.
const SOIL_EMPTY_A = new THREE.Color(0x8a6a45);
const SOIL_EMPTY_B = new THREE.Color(0x7d5f3c);
const SOIL_TILLED = new THREE.Color(0x543b26);

const MAX_CELLS = 40 * 40;

const PART_NAMES: PlantPartName[] = ["stalk", "canopy", "crown", "fruit"];

/**
 * Campo 3D interativo: um "terreno" de células onde o clique (ou arrasto)
 * planta a cultura ativa e as plantas evoluem visualmente com o dia da
 * simulação. Câmera orbital: arraste fora do terreno (ou botão direito)
 * gira, e a roda do mouse aproxima.
 */
export function FieldCanvas({
  rows,
  cols,
  cells,
  day,
  conditions,
  onPaintCell,
  onHoverCell,
}: FieldCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dados mutáveis lidos pelos handlers/refresh sem recriar a cena.
  const cellsRef = useRef(cells);
  const dayRef = useRef(day);
  const conditionsRef = useRef(conditions);
  const onPaintRef = useRef(onPaintCell);
  const onHoverRef = useRef(onHoverCell);
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onPaintRef.current = onPaintCell;
    onHoverRef.current = onHoverCell;
  }, [onPaintCell, onHoverCell]);

  // (Re)constrói a cena quando o tamanho do grid muda.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const maxDim = Math.max(rows, cols);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, maxDim * 12);
    camera.position.set(0, maxDim * 0.85, maxDim * 1.1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.minDistance = 3;
    controls.maxDistance = maxDim * 3;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };

    // Iluminação: céu frio + sol quente com sombras suaves.
    scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x4a3520, 1.15));
    const sun = new THREE.DirectionalLight(0xfff2d9, 1.6);
    sun.position.set(maxDim * 0.8, maxDim * 1.3, maxDim * 0.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const shadowSpan = maxDim * 0.75 + 1;
    sun.shadow.camera.left = -shadowSpan;
    sun.shadow.camera.right = shadowSpan;
    sun.shadow.camera.top = shadowSpan;
    sun.shadow.camera.bottom = -shadowSpan;
    sun.shadow.camera.far = maxDim * 5;
    scene.add(sun);

    // Base do terreno ("ilha" de terra sob as células).
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(cols + 1.4, 0.7, rows + 1.4),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 }),
    );
    base.position.y = -0.36;
    base.receiveShadow = true;
    scene.add(base);

    // Células e peças das plantas como malhas instanciadas (uma draw call
    // cada): caule cilíndrico, copa arredondada, coroa cônica e detalhe
    // esférico (espiga/fruto/tubérculo/monte de semente).
    const tileGeometry = new THREE.BoxGeometry(0.92, 0.14, 0.92);
    const stalkGeometry = new THREE.CylinderGeometry(0.055, 0.08, 1, 7);
    stalkGeometry.translate(0, 0.5, 0); // base no chão; escala y = altura
    // Detalhe 0 no icosaedro + flat shading dão o visual "low-poly" facetado.
    const canopyGeometry = new THREE.IcosahedronGeometry(0.32, 0);
    const crownGeometry = new THREE.ConeGeometry(0.3, 1, 6);
    crownGeometry.translate(0, 0.5, 0);
    const fruitGeometry = new THREE.IcosahedronGeometry(0.16, 1);

    const plainMaterial = (flat = false) =>
      new THREE.MeshStandardMaterial({
        roughness: 0.85,
        metalness: 0,
        flatShading: flat,
      });

    const tiles = new THREE.InstancedMesh(tileGeometry, plainMaterial(), MAX_CELLS);
    const plantMeshes: Record<PlantPartName, THREE.InstancedMesh> = {
      stalk: new THREE.InstancedMesh(stalkGeometry, plainMaterial(), MAX_CELLS),
      canopy: new THREE.InstancedMesh(canopyGeometry, plainMaterial(true), MAX_CELLS),
      crown: new THREE.InstancedMesh(crownGeometry, plainMaterial(true), MAX_CELLS),
      fruit: new THREE.InstancedMesh(fruitGeometry, plainMaterial(true), MAX_CELLS),
    };
    const allInstanced = [tiles, ...PART_NAMES.map((n) => plantMeshes[n])];
    tiles.receiveShadow = true;
    for (const name of PART_NAMES) plantMeshes[name].castShadow = true;
    for (const mesh of allInstanced) {
      mesh.count = rows * cols;
      mesh.frustumCulled = false;
      scene.add(mesh);
    }

    // Realce da célula sob o cursor.
    const highlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.98, 0.17, 0.98),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    );
    highlight.visible = false;
    scene.add(highlight);

    const cellX = (index: number) => (index % cols) - (cols - 1) / 2;
    const cellZ = (index: number) => Math.floor(index / cols) - (rows - 1) / 2;

    // Atualiza posição/escala/cor de cada instância a partir do estado atual.
    const dummy = new THREE.Object3D();
    const parts = createPlantInstance();
    const refresh = () => {
      const currentCells = cellsRef.current;
      const currentDay = dayRef.current;
      const currentConditions = conditionsRef.current;
      const suitByCrop = new Map<string, number>();

      for (let index = 0; index < rows * cols; index++) {
        const x = cellX(index);
        const z = cellZ(index);
        const cell = currentCells[index] ?? null;
        const crop = getCrop(cell?.cropId ?? null);

        // Célula do solo (vazia recebe leve variação em xadrez).
        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        tiles.setMatrixAt(index, dummy.matrix);
        const checker = (Math.floor(index / cols) + (index % cols)) % 2 === 0;
        tiles.setColorAt(
          index,
          cell ? SOIL_TILLED : checker ? SOIL_EMPTY_A : SOIL_EMPTY_B,
        );

        if (!cell || !crop) {
          // Sem planta: todas as peças invisíveis (escala zero).
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          for (const name of PART_NAMES) {
            plantMeshes[name].setMatrixAt(index, dummy.matrix);
          }
          continue;
        }

        let suit = suitByCrop.get(crop.id);
        if (suit === undefined) {
          suit = cropSuitability(crop.id, currentConditions);
          suitByCrop.set(crop.id, suit);
        }
        const progress = growthProgress(
          currentDay - cell.plantedDay,
          crop.cycleDays,
          suit,
        );
        const stage = growthStage(progress, suit);
        computePlantInstance(crop, progress, stage, parts);

        // Variação determinística por célula (giro, escala e posição) para o
        // campo não parecer um carimbo repetido.
        const hash = (index * 2654435761) >>> 0;
        const rotY = (hash % 628) / 100;
        const jitterScale = 0.92 + ((hash >>> 8) % 17) / 100;
        const jx = (((hash >>> 16) % 11) - 5) / 100;
        const jz = (((hash >>> 24) % 11) - 5) / 100;
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);

        for (const name of PART_NAMES) {
          const part = parts[name];
          const mesh = plantMeshes[name];
          if (!part.visible) {
            dummy.scale.set(0, 0, 0);
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
            continue;
          }
          // O deslocamento lateral da peça gira junto com a planta.
          const ox = part.x * cosY + part.z * sinY;
          const oz = -part.x * sinY + part.z * cosY;
          dummy.position.set(x + jx + ox, part.y, z + jz + oz);
          dummy.rotation.set(0, rotY, part.rotZ);
          dummy.scale.set(
            part.sx * jitterScale,
            part.sy,
            part.sz * jitterScale,
          );
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          mesh.setColorAt(index, part.color);
        }
      }

      for (const mesh of allInstanced) {
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    };
    refreshRef.current = refresh;
    refresh();

    // Interação: raycast nas células para pintar/realçar; a câmera orbita
    // quando o arrasto começa fora do terreno (controls é desabilitado ao
    // iniciar uma pintura).
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let painting = false;
    let lastPainted = -1;
    let hovered: number | null = null;

    const pickCell = (event: PointerEvent): number | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(tiles, false)[0];
      return hit?.instanceId ?? null;
    };

    const setHovered = (index: number | null) => {
      if (index === hovered) return;
      hovered = index;
      if (index === null) {
        highlight.visible = false;
        renderer.domElement.style.cursor = "grab";
      } else {
        highlight.visible = true;
        highlight.position.set(cellX(index), 0.02, cellZ(index));
        renderer.domElement.style.cursor = "pointer";
      }
      onHoverRef.current(index);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      const index = pickCell(event);
      if (index === null) return;
      painting = true;
      lastPainted = index;
      controls.enabled = false;
      onPaintRef.current(index);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const index = pickCell(event);
      setHovered(index);
      if (painting && index !== null && index !== lastPainted) {
        lastPainted = index;
        onPaintRef.current(index);
      }
    };

    const stopPainting = () => {
      painting = false;
      lastPainted = -1;
      controls.enabled = true;
    };

    const handlePointerLeave = () => {
      setHovered(null);
      stopPainting();
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerup", stopPainting);
    window.addEventListener("pointercancel", stopPainting);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      refreshRef.current = null;
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerup", stopPainting);
      window.removeEventListener("pointercancel", stopPainting);
      renderer.setAnimationLoop(null);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const material = obj.material as THREE.Material;
          material.dispose();
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [rows, cols]);

  // Reflete plantio, avanço do tempo e mudanças de condições na cena.
  useEffect(() => {
    cellsRef.current = cells;
    dayRef.current = day;
    conditionsRef.current = conditions;
    refreshRef.current?.();
  }, [cells, day, conditions]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label={`Terreno 3D com ${rows} linhas e ${cols} colunas. Clique ou arraste nas células para plantar.`}
    />
  );
}
