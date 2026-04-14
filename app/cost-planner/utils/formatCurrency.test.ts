import { formatCurrency } from "./formatCurrency";
import { CurrencyConfig } from "../types";

describe("formatCurrency", () => {
  const BRL: CurrencyConfig = {
    code: "BRL",
    symbol: "R$",
    locale: "pt-BR",
    decimalPlaces: 2,
  };

  const USD: CurrencyConfig = {
    code: "USD",
    symbol: "US$",
    locale: "en-US",
    decimalPlaces: 2,
  };

  const EUR: CurrencyConfig = {
    code: "EUR",
    symbol: "€",
    locale: "en-US",
    decimalPlaces: 2,
  };

  it("formats BRL values with R$ symbol", () => {
    const result = formatCurrency(1234.56, BRL);
    expect(result).toContain("R$");
    expect(result).toContain("1.234,56");
  });

  it("formats USD values with US$ symbol", () => {
    const result = formatCurrency(1234.56, USD);
    expect(result).toContain("US$");
    expect(result).toContain("1,234.56");
  });

  it("formats EUR values with € symbol", () => {
    const result = formatCurrency(99.9, EUR);
    expect(result).toContain("€");
    expect(result).toContain("99.90");
  });

  it("formats zero correctly", () => {
    const result = formatCurrency(0, BRL);
    expect(result).toContain("R$");
    expect(result).toContain("0,00");
  });

  it("formats large numbers with thousand separators", () => {
    const result = formatCurrency(1000000, BRL);
    expect(result).toContain("R$");
    expect(result).toContain("1.000.000,00");
  });

  it("respects decimalPlaces configuration", () => {
    const noDecimals: CurrencyConfig = { ...BRL, decimalPlaces: 0 };
    const result = formatCurrency(99.99, noDecimals);
    expect(result).not.toContain(",99");
  });
});
