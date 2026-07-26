import { Period } from "../types/index";

export interface CurrencyHistoryPoint {
  time: string;
  mid: number;
  bid: number;
  ask: number;
}

export interface CurrencyHistoryResponse {
  code: string;
  currency: string;
  data: CurrencyHistoryPoint[];
}

const baseRates: Record<string, { rate: number; currency: string }> = {
  EUR: { rate: 4.32, currency: "euro" },
  USD: { rate: 3.98, currency: "dolar amerykański" },
  CHF: { rate: 4.48, currency: "frank szwajcarski" },
  GBP: { rate: 5.05, currency: "funt szterling" },
  JPY: { rate: 0.027, currency: "jen" },
  CZK: { rate: 0.172, currency: "korona czeska" },
  SEK: { rate: 0.38, currency: "korona szwedzka" },
  NOK: { rate: 0.37, currency: "korona norweska" },
  DKK: { rate: 0.58, currency: "korona duńska" },
  CAD: { rate: 2.92, currency: "dolar kanadyjski" },
  AUD: { rate: 2.58, currency: "dolar australijski" },
  HUF: { rate: 0.011, currency: "forint węgierski" },
};

function periodToDays(period: Period): number {
  switch (period) {
    case "1w": return 7;
    case "3m": return 90;
    case "1y": return 365;
    case "3y": return 1095;
    case "10y": return 3650;
    case "max": return 7300;
  }
}

function generateCurrencyHistory(baseRate: number, days: number): CurrencyHistoryPoint[] {
  const data = [];
  let currentRate = baseRate;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const volatility = baseRate * 0.008;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.5) * volatility * 2;
    currentRate = Math.max(currentRate + change, baseRate * 0.7);
    currentRate = Math.min(currentRate, baseRate * 1.3);

    const spread = currentRate * 0.01;
    const mid = parseFloat(currentRate.toFixed(4));
    const bid = parseFloat((mid - spread / 2).toFixed(4));
    const ask = parseFloat((mid + spread / 2).toFixed(4));

    data.push({
      time: date.toISOString().split("T")[0],
      mid,
      bid,
      ask,
    });
  }

  return data;
}

export function getMockCurrencyHistory(code: string, period: Period = "1y"): CurrencyHistoryResponse {
  const info = baseRates[code] || { rate: 1.0, currency: code };
  const days = periodToDays(period);

  return {
    code,
    currency: info.currency,
    data: generateCurrencyHistory(info.rate, days),
  };
}
