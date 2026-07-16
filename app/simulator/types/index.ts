/** Silhueta 3D usada para desenhar a planta no terreno. */
export type PlantForm =
  | "cereal-alto" // caule alto com palmito de folhas e espiga lateral (milho)
  | "cana" // touceira alta de colmos com plumas no topo
  | "espiga" // caule fino que doura e ganha espiga no topo (trigo, arroz)
  | "arbusto" // moita baixa e redonda com vagens (soja, feijão)
  | "cafeeiro" // tronco curto com copa densa e frutos vermelhos
  | "algodoeiro" // arbusto com capuchos brancos no topo
  | "raiz"; // rama baixa com tubérculos aparecendo na base (mandioca, batata)

export type Crop = {
  id: string;
  name: string;
  emoji: string;
  /** Duração do ciclo em dias, em condições ótimas (base FAO Ecocrop). */
  cycleDays: number;
  /** Silhueta 3D da planta. */
  form: PlantForm;
  /** Altura da planta adulta na cena 3D, em unidades de célula. */
  matureHeight: number;
  /** Cor (hex) da folhagem adulta na cena 3D. */
  foliageColor: number;
  /** Cor (hex) do "fruto"/produto visível quando pronta para colheita. */
  fruitColor: number;
};

/** Special palette tool that clears a cell instead of planting. */
export const ERASER_TOOL = "eraser";

export type Tool = string;

export type CellState = {
  cropId: string;
  /** Dia da simulação em que a célula foi plantada. */
  plantedDay: number;
};

export type GridState = {
  rows: number;
  cols: number;
  /** Flat row-major array of length rows*cols; each entry is a planted cell or null. */
  cells: (CellState | null)[];
  /** Dia atual da simulação (fracionário durante a reprodução). */
  day: number;
};

/** Condições do terreno usadas para pontuar o crescimento (clima + solo). */
export type FieldConditions = {
  /** Temperatura média do ar em °C. */
  temperature: number;
  /** pH do solo. */
  ph: number;
  /** De onde vieram os valores (ajuste manual ou dados reais do mapa). */
  source: "manual" | "mapa";
  /** Rótulo da região quando as condições vieram do mapa. */
  regionLabel?: string;
};

export type GrowthStage =
  | "semente"
  | "broto"
  | "crescimento"
  | "colheita"
  | "murcha";
