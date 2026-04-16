export function weatherCodeToText(code: number) {
  const map: Record<number, string> = {
    0: "Céu limpo",
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina com geada",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa intensa",
    61: "Chuva fraca",
    63: "Chuva moderada",
    65: "Chuva forte",
    71: "Neve fraca",
    73: "Neve moderada",
    75: "Neve forte",
    80: "Pancadas de chuva fracas",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva fortes",
    95: "Tempestade",
  };

  return map[code] ?? "Condição climática variável";
}

export function buildClimateSummary(current: {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
}) {
  if (!current) return "Sem dados climáticos disponíveis.";

  const temp = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const wind = current.wind_speed_10m;
  const code = current.weather_code;

  const condition = weatherCodeToText(code);

  return `${condition}. Temperatura de ${temp}°C, umidade de ${humidity}% e vento de ${wind} km/h.`;
}
