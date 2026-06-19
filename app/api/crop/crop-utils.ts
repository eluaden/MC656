// Recomendação de cultura baseada no modelo de adequação ECOCROP (FAO).
//
// Fonte dos limiares: base de dados ECOCROP da FAO (Crop Ecological Requirements
// Database), redistribuída em https://github.com/OpenCLIM/ecocrop (EcoCrop_DB.csv).
// Para cada cultura a FAO define quatro limiares por variável:
//   absMin → optMin → optMax → absMax
// Entre optMin e optMax a adequação é máxima (1); entre o limiar absoluto e o
// ótimo ela cai linearmente até 0; fora da faixa absoluta é 0. É o mesmo modelo
// trapezoidal usado pelo EcoCrop. Aqui pontuamos com as variáveis que coletamos
// (temperatura do ar e pH do solo); chuva é mantida para uso futuro.

export type SoilTexture = "arenoso" | "franco" | "argiloso" | "desconhecido";

export type CropConditions = {
  ph: number | null; // pH real (ex.: 6.5)
  clayPct: number | null; // % de argila
  sandPct: number | null; // % de areia
  siltPct: number | null; // % de silte
  temperature: number | null; // °C
};

/** Limiares ECOCROP de uma variável: absoluto/ótimo mín e ótimo/absoluto máx. */
export type EcocropRange = {
  absMin: number;
  optMin: number;
  optMax: number;
  absMax: number;
};

export type Crop = {
  id: string;
  name: string;
  emoji: string;
  temp: EcocropRange; // °C (temperatura média)
  ph: EcocropRange; // pH do solo
  rainfall: EcocropRange; // mm/ciclo (não pontuado ainda — uso futuro)
  description: string;
  tips: string;
};

export type MatchLabel = "Alta" | "Média" | "Baixa";

export type CropRecommendation = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tips: string;
  score: number; // 0..100
  matchLabel: MatchLabel;
};

export const ECOCROP_SOURCE =
  "FAO Ecocrop (Crop Ecological Requirements Database)";

// Valores extraídos diretamente do EcoCrop_DB.csv da FAO.
export const CROP_TABLE: Crop[] = [
  {
    id: "soja",
    name: "Soja",
    emoji: "🌱",
    temp: { absMin: 10, optMin: 20, optMax: 33, absMax: 38 },
    ph: { absMin: 4.5, optMin: 5.5, optMax: 6.5, absMax: 8.4 },
    rainfall: { absMin: 450, optMin: 600, optMax: 1500, absMax: 1800 },
    description: "Leguminosa de ciclo curto, exigente em solos férteis e bem drenados.",
    tips: "Ótimo entre 20 e 33 °C e pH 5,5–6,5. Sensível a encharcamento (FAO Ecocrop).",
  },
  {
    id: "milho",
    name: "Milho",
    emoji: "🌽",
    temp: { absMin: 10, optMin: 18, optMax: 33, absMax: 47 },
    ph: { absMin: 4.5, optMin: 5, optMax: 7, absMax: 8.5 },
    rainfall: { absMin: 400, optMin: 600, optMax: 1200, absMax: 1800 },
    description: "Cereal de alta produtividade e ampla adaptação climática.",
    tips: "Ótimo entre 18 e 33 °C e pH 5,0–7,0. Tolera ampla faixa térmica (FAO Ecocrop).",
  },
  {
    id: "cafe",
    name: "Café (arábica)",
    emoji: "☕",
    temp: { absMin: 10, optMin: 14, optMax: 28, absMax: 34 },
    ph: { absMin: 4.3, optMin: 5.5, optMax: 7, absMax: 8.4 },
    rainfall: { absMin: 750, optMin: 1400, optMax: 2300, absMax: 4200 },
    description: "Cultura perene de clima ameno, comum em regiões de altitude.",
    tips: "Ótimo entre 14 e 28 °C e pH 5,5–7,0. Sensível a geadas (FAO Ecocrop).",
  },
  {
    id: "cana",
    name: "Cana-de-açúcar",
    emoji: "🎍",
    temp: { absMin: 15, optMin: 24, optMax: 37, absMax: 41 },
    ph: { absMin: 4.5, optMin: 5, optMax: 8, absMax: 9 },
    rainfall: { absMin: 1000, optMin: 1500, optMax: 2000, absMax: 5000 },
    description: "Gramínea tropical de alta demanda térmica e hídrica.",
    tips: "Ótimo entre 24 e 37 °C e pH 5,0–8,0. Clima quente e úmido (FAO Ecocrop).",
  },
  {
    id: "arroz",
    name: "Arroz",
    emoji: "🌾",
    temp: { absMin: 10, optMin: 20, optMax: 30, absMax: 36 },
    ph: { absMin: 4.5, optMin: 5.5, optMax: 7, absMax: 9 },
    rainfall: { absMin: 1000, optMin: 1500, optMax: 2000, absMax: 4000 },
    description: "Cereal adaptado a solos que retêm bem a água.",
    tips: "Ótimo entre 20 e 30 °C e pH 5,5–7,0. Exige bastante água (FAO Ecocrop).",
  },
  {
    id: "feijao",
    name: "Feijão",
    emoji: "🫘",
    temp: { absMin: 7, optMin: 16, optMax: 25, absMax: 32 },
    ph: { absMin: 4, optMin: 5.5, optMax: 7.5, absMax: 9 },
    rainfall: { absMin: 300, optMin: 500, optMax: 2000, absMax: 4300 },
    description: "Leguminosa de ciclo curto, sensível a extremos de temperatura.",
    tips: "Ótimo entre 16 e 25 °C e pH 5,5–7,5. Clima ameno (FAO Ecocrop).",
  },
  {
    id: "mandioca",
    name: "Mandioca",
    emoji: "🥔",
    temp: { absMin: 10, optMin: 20, optMax: 29, absMax: 35 },
    ph: { absMin: 4, optMin: 5.5, optMax: 8, absMax: 9 },
    rainfall: { absMin: 500, optMin: 1000, optMax: 1500, absMax: 5000 },
    description: "Raiz rústica, tolerante a solos pobres e ácidos.",
    tips: "Ótimo entre 20 e 29 °C e pH 5,5–8,0. Tolera seca, não geada (FAO Ecocrop).",
  },
  {
    id: "trigo",
    name: "Trigo",
    emoji: "🌾",
    temp: { absMin: 5, optMin: 15, optMax: 23, absMax: 27 },
    ph: { absMin: 5.5, optMin: 6, optMax: 7, absMax: 8.5 },
    rainfall: { absMin: 300, optMin: 750, optMax: 900, absMax: 1600 },
    description: "Cereal de inverno, adaptado a temperaturas mais baixas.",
    tips: "Ótimo entre 15 e 23 °C e pH 6,0–7,0. Clima ameno a frio (FAO Ecocrop).",
  },
  {
    id: "algodao",
    name: "Algodão",
    emoji: "🧶",
    temp: { absMin: 15, optMin: 22, optMax: 36, absMax: 42 },
    ph: { absMin: 5, optMin: 6, optMax: 7.5, absMax: 9.5 },
    rainfall: { absMin: 450, optMin: 750, optMax: 1200, absMax: 1500 },
    description: "Fibra de clima quente, exigente em luminosidade.",
    tips: "Ótimo entre 22 e 36 °C e pH 6,0–7,5. Clima quente (FAO Ecocrop).",
  },
  {
    id: "batata",
    name: "Batata",
    emoji: "🥔",
    temp: { absMin: 7, optMin: 15, optMax: 25, absMax: 30 },
    ph: { absMin: 4.2, optMin: 5, optMax: 6.2, absMax: 8.5 },
    rainfall: { absMin: 250, optMin: 500, optMax: 800, absMax: 2000 },
    description: "Tubérculo de clima ameno, prefere solos soltos e arejados.",
    tips: "Ótimo entre 15 e 25 °C e pH 5,0–6,2. Clima ameno (FAO Ecocrop).",
  },
];

/**
 * Classifica a textura do solo a partir das frações de argila e areia (%).
 * Usada apenas para exibição; não entra na pontuação ECOCROP.
 */
export function classifyTexture(
  clayPct: number | null,
  sandPct: number | null
): SoilTexture {
  if (clayPct === null && sandPct === null) return "desconhecido";
  if (sandPct !== null && sandPct >= 70) return "arenoso";
  if (clayPct !== null && clayPct >= 35) return "argiloso";
  return "franco";
}

export function textureLabel(texture: SoilTexture): string {
  const labels: Record<SoilTexture, string> = {
    arenoso: "Solo arenoso",
    franco: "Solo franco (equilibrado)",
    argiloso: "Solo argiloso",
    desconhecido: "Textura do solo desconhecida",
  };
  return labels[texture];
}

/**
 * Adequação ECOCROP de uma variável (0..1) pelo modelo trapezoidal de 4 limiares.
 * Retorna null quando o valor é desconhecido (a variável é então ignorada).
 */
export function suitability(
  value: number | null,
  range: EcocropRange
): number | null {
  if (value === null) return null;
  if (value <= range.absMin || value >= range.absMax) return 0;
  if (value >= range.optMin && value <= range.optMax) return 1;
  if (value < range.optMin) {
    return (value - range.absMin) / (range.optMin - range.absMin);
  }
  return (range.absMax - value) / (range.absMax - range.optMax);
}

function toMatchLabel(score: number): MatchLabel {
  if (score >= 70) return "Alta";
  if (score >= 40) return "Média";
  return "Baixa";
}

/**
 * Pontuação ECOCROP (0..100): produto das adequações das variáveis conhecidas
 * (temperatura e pH). Segue a convenção do EcoCrop de combinar fatores por
 * multiplicação. Variáveis ausentes (além do solo) são ignoradas.
 *
 * O pH do solo é obrigatório: sem dados de solo não há base para recomendar,
 * então a pontuação é 0 para todas as culturas.
 */
export function scoreCrop(crop: Crop, conditions: CropConditions): number {
  if (conditions.ph === null) return 0;

  const factors = [
    suitability(conditions.temperature, crop.temp),
    suitability(conditions.ph, crop.ph),
  ].filter((s): s is number => s !== null);

  if (factors.length === 0) return 0;

  const product = factors.reduce((acc, s) => acc * s, 1);
  return Math.round(product * 100);
}

/**
 * Retorna as culturas mais adequadas, ordenadas por pontuação (desc).
 */
export function recommendCrops(
  conditions: CropConditions,
  limit = 4
): CropRecommendation[] {
  return CROP_TABLE.map((crop) => {
    const score = scoreCrop(crop, conditions);
    return {
      id: crop.id,
      name: crop.name,
      emoji: crop.emoji,
      description: crop.description,
      tips: crop.tips,
      score,
      matchLabel: toMatchLabel(score),
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
