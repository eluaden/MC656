// Silhuetas 3D das plantas: cada cultura é montada a partir de quatro
// "peças" instanciadas na cena (caule cilíndrico, copa arredondada, coroa
// cônica e um detalhe esférico para espigas/frutos/tubérculos). Este módulo
// só calcula transformações e cores — a cena aplica nas malhas instanciadas.

import * as THREE from "three";
import { Crop, GrowthStage } from "../types";

/** Peças disponíveis por planta (uma instância de cada por célula). */
export type PlantPartName = "stalk" | "canopy" | "crown" | "fruit";

export type PlantPart = {
  visible: boolean;
  /** Deslocamento a partir do centro da célula (y a partir do topo do solo). */
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  /** Inclinação (rad) — usada em espigas e plantas murchas. */
  rotZ: number;
  color: THREE.Color;
};

export type PlantInstance = Record<PlantPartName, PlantPart>;

const SPROUT_COLOR = new THREE.Color(0xa9d977);
const WITHERED_FOLIAGE = new THREE.Color(0x9c7a4a);
const WITHERED_STALK = new THREE.Color(0x7a5c3a);
const SEED_MOUND_COLOR = new THREE.Color(0x7a5a38);
const TRUNK_COLOR = new THREE.Color(0x6d4c33);

// Cores por cultura, materializadas uma única vez.
const colorCache = new Map<
  string,
  { foliage: THREE.Color; fruit: THREE.Color }
>();

function cropColors(crop: Crop) {
  let colors = colorCache.get(crop.id);
  if (!colors) {
    colors = {
      foliage: new THREE.Color(crop.foliageColor),
      fruit: new THREE.Color(crop.fruitColor),
    };
    colorCache.set(crop.id, colors);
  }
  return colors;
}

function makePart(): PlantPart {
  return {
    visible: false,
    x: 0,
    y: 0,
    z: 0,
    sx: 1,
    sy: 1,
    sz: 1,
    rotZ: 0,
    color: new THREE.Color(),
  };
}

/** Aloca a estrutura reutilizada a cada atualização da cena. */
export function createPlantInstance(): PlantInstance {
  return {
    stalk: makePart(),
    canopy: makePart(),
    crown: makePart(),
    fruit: makePart(),
  };
}

function set(
  part: PlantPart,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  rotZ = 0,
): PlantPart {
  part.visible = true;
  part.x = x;
  part.y = y;
  part.z = z;
  part.sx = sx;
  part.sy = sy;
  part.sz = sz;
  part.rotZ = rotZ;
  return part;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Preenche `out` com as peças da planta para um dado progresso/estágio.
 * p = progresso (0..1); as dimensões derivam de matureHeight da cultura.
 */
export function computePlantInstance(
  crop: Crop,
  progress: number,
  stage: GrowthStage,
  out: PlantInstance,
): void {
  out.stalk.visible = false;
  out.canopy.visible = false;
  out.crown.visible = false;
  out.fruit.visible = false;

  // Semente: só o montinho de terra.
  if (stage === "semente") {
    set(out.fruit, 0, 0.09, 0, 0.9, 0.35, 0.9).color.copy(SEED_MOUND_COLOR);
    return;
  }

  const p = clamp01(progress);
  const H = crop.matureHeight;
  const h = 0.06 + p * H; // altura atual
  const g = 0.3 + 0.7 * p; // "grossura" geral
  const f = clamp01((p - 0.72) / 0.28); // revelação do fruto/espiga
  const { foliage, fruit } = cropColors(crop);
  const grow = clamp01(p * 1.4); // verde-claro → cor adulta

  switch (crop.form) {
    case "cereal-alto": {
      set(out.stalk, 0, 0.07, 0, g * 0.9, h, g * 0.9)
        .color.copy(SPROUT_COLOR)
        .lerp(foliage, grow);
      if (p > 0.15) {
        set(out.crown, 0, 0.07 + h * 0.5, 0, g * 1.2, h * 0.5, g * 1.2)
          .color.copy(out.stalk.color)
          .multiplyScalar(0.85);
      }
      if (f > 0) {
        // Espiga afastada do caule para não sumir dentro do palmito.
        set(out.fruit, 0.2, 0.07 + h * 0.38, 0, f * 0.8, f * 1.7, f * 0.8, -0.25)
          .color.copy(fruit);
      }
      break;
    }
    case "cana": {
      set(out.stalk, 0, 0.07, 0, g * 1.4, h, g * 1.4)
        .color.copy(SPROUT_COLOR)
        .lerp(foliage, grow)
        .lerp(fruit, 0.4 * p);
      if (p > 0.25) {
        set(out.crown, 0, 0.07 + h * 0.8, 0, g * 1.2, h * 0.45, g * 1.2)
          .color.copy(foliage)
          .lerp(SPROUT_COLOR, 0.35);
      }
      break;
    }
    case "espiga": {
      const gold = clamp01((p - 0.55) / 0.45);
      set(out.stalk, 0, 0.07, 0, g * 0.55, h, g * 0.55)
        .color.copy(SPROUT_COLOR)
        .lerp(foliage, grow)
        .lerp(fruit, gold);
      if (gold > 0) {
        // Cabeça de grãos: elipsoide dourado levemente inclinado no topo.
        set(
          out.fruit,
          0.02,
          0.07 + h * 0.98,
          0,
          gold * 0.55,
          gold * 1.35,
          gold * 0.55,
          0.2,
        ).color.copy(fruit);
      }
      break;
    }
    case "arbusto": {
      const bushY = 0.1 + p * H * 0.55;
      const bushW = 0.32 + 0.9 * p;
      const bushH = 0.28 + 0.62 * p;
      set(out.stalk, 0, 0.07, 0, g * 0.45, 0.08 + p * H * 0.4, g * 0.45)
        .color.copy(foliage)
        .multiplyScalar(0.7);
      set(out.canopy, 0, bushY, 0, bushW, bushH, bushW)
        .color.copy(SPROUT_COLOR)
        .lerp(foliage, grow);
      if (f > 0) {
        // Vagens despontando na lateral da moita.
        set(out.fruit, 0.32 * bushW, bushY - 0.05, 0.1, f * 0.65, f * 0.85, f * 0.65)
          .color.copy(fruit);
      }
      break;
    }
    case "cafeeiro": {
      set(out.stalk, 0, 0.07, 0, g * 0.7, h * 0.55, g * 0.7).color.copy(
        TRUNK_COLOR,
      );
      const crownY = 0.07 + h * 0.62;
      const crownW = 0.35 + 0.85 * p;
      set(out.canopy, 0, crownY, 0, crownW, 0.32 + 0.7 * p, crownW)
        .color.copy(SPROUT_COLOR)
        .lerp(foliage, grow);
      if (f > 0) {
        // Cacho de frutos na borda da copa, para ficar à mostra.
        set(out.fruit, 0.3 * crownW, crownY - 0.06, 0.18, f * 0.7, f * 0.55, f * 0.7)
          .color.copy(fruit);
      }
      break;
    }
    case "algodoeiro": {
      const bushY = 0.1 + p * H * 0.45;
      const bushH = 0.3 + 0.65 * p;
      set(out.stalk, 0, 0.07, 0, g * 0.5, 0.08 + p * H * 0.4, g * 0.5)
        .color.copy(foliage)
        .multiplyScalar(0.7);
      set(out.canopy, 0, bushY, 0, 0.32 + 0.85 * p, bushH, 0.32 + 0.85 * p)
        .color.copy(SPROUT_COLOR)
        .lerp(foliage, grow);
      if (f > 0) {
        // Capuchos brancos coroando o topo do arbusto.
        set(
          out.fruit,
          0.04,
          bushY + 0.32 * bushH * 0.9,
          0.04,
          f * 0.95,
          f * 0.75,
          f * 0.95,
        ).color.copy(fruit);
      }
      break;
    }
    case "raiz": {
      set(out.stalk, 0, 0.07, 0, g * 0.5, h * 0.6, g * 0.5)
        .color.copy(foliage)
        .multiplyScalar(0.75);
      set(
        out.canopy,
        0,
        0.07 + h * 0.6,
        0,
        0.35 + 0.85 * p,
        0.28 + 0.55 * p,
        0.35 + 0.85 * p,
      )
        .color.copy(SPROUT_COLOR)
        .lerp(foliage, grow);
      if (f > 0) {
        // Tubérculos despontando da terra ao lado da rama.
        set(out.fruit, 0.22, 0.08, -0.08, f * 1.1, f * 0.45, f * 1.1)
          .color.copy(fruit);
      }
      break;
    }
  }

  // Murcha: tons de palha, planta tombada e encolhida.
  if (stage === "murcha") {
    for (const name of ["stalk", "canopy", "crown", "fruit"] as const) {
      const part = out[name];
      if (!part.visible) continue;
      part.color.copy(name === "stalk" ? WITHERED_STALK : WITHERED_FOLIAGE);
      part.rotZ += 0.45;
      part.sy *= 0.6;
    }
  }
}
