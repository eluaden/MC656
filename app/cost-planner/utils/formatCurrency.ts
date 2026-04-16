import { CurrencyConfig } from "../types";

export function formatCurrency(value: number, currency: CurrencyConfig): string {
  const formatted = new Intl.NumberFormat(currency.locale, {
    maximumFractionDigits: currency.decimalPlaces,
    minimumFractionDigits: currency.decimalPlaces,
  }).format(value);

  return `${currency.symbol} ${formatted}`;
}
