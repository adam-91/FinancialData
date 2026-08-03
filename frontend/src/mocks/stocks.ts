import { StockCompany, StockOHLCV, Period } from "../types/stock";

export const mockStocks: StockCompany[] = [
  {
    symbol: "CDR",
    yahoo_symbol: "CDR.WA",
    name: "CD Projekt",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 185.50,
      high: 188.90,
      low: 184.20,
      close: 187.30,
      volume: 2500000,
      change: 1.80,
      change_percent: 0.97,
    },
  },
  {
    symbol: "PKN",
    yahoo_symbol: "PKN.WA",
    name: "PKN Orlen",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 72.10,
      high: 73.45,
      low: 71.80,
      close: 72.95,
      volume: 3200000,
      change: 0.85,
      change_percent: 1.18,
    },
  },
  {
    symbol: "KGH",
    yahoo_symbol: "KGH.WA",
    name: "KGHM Polska Miedź",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 125.40,
      high: 127.80,
      low: 124.90,
      close: 126.50,
      volume: 1800000,
      change: 1.10,
      change_percent: 0.88,
    },
  },
  {
    symbol: "PZU",
    yahoo_symbol: "PZU.WA",
    name: "PZU",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 42.30,
      high: 43.10,
      low: 42.00,
      close: 42.85,
      volume: 2100000,
      change: 0.55,
      change_percent: 1.30,
    },
  },
  {
    symbol: "PKO",
    yahoo_symbol: "PKO.WA",
    name: "PKO Bank Polski",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 55.20,
      high: 56.40,
      low: 54.90,
      close: 55.80,
      volume: 2800000,
      change: 0.60,
      change_percent: 1.09,
    },
  },
  {
    symbol: "LPP",
    yahoo_symbol: "LPP.WA",
    name: "LPP",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 14500.00,
      high: 14750.00,
      low: 14400.00,
      close: 14650.00,
      volume: 15000,
      change: 150.00,
      change_percent: 1.03,
    },
  },
  {
    symbol: "ALE",
    yahoo_symbol: "ALE.WA",
    name: "Allegro",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 32.50,
      high: 33.20,
      low: 32.30,
      close: 32.95,
      volume: 4500000,
      change: 0.45,
      change_percent: 1.38,
    },
  },
  {
    symbol: "DNP",
    yahoo_symbol: "DNP.WA",
    name: "Dino Polska",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 425.00,
      high: 432.00,
      low: 423.50,
      close: 429.50,
      volume: 350000,
      change: 4.50,
      change_percent: 1.06,
    },
  },
  {
    symbol: "JSW",
    yahoo_symbol: "JSW.WA",
    name: "JSW",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 28.90,
      high: 29.50,
      low: 28.60,
      close: 29.20,
      volume: 1900000,
      change: 0.30,
      change_percent: 1.04,
    },
  },
  {
    symbol: "PEO",
    yahoo_symbol: "PEO.WA",
    name: "Bank Pekao",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG"],
    price: {
      trading_date: "2024-01-15",
      open: 145.00,
      high: 147.50,
      low: 144.50,
      close: 146.80,
      volume: 950000,
      change: 1.80,
      change_percent: 1.24,
    },
  },
  {
    symbol: "SPL",
    yahoo_symbol: "SPL.WA",
    name: "Santander Bank Polska",
    stock_exchange: "GPW",
    indices: ["^WIG20", "^WIG", "^MWIG40"],
    price: {
      trading_date: "2024-01-15",
      open: 520.00,
      high: 535.00,
      low: 518.00,
      close: 530.00,
      volume: 450000,
      change: 10.00,
      change_percent: 1.92,
    },
  },
  {
    symbol: "CPS",
    yahoo_symbol: "CPS.WA",
    name: "Cyfrowy Polsat",
    stock_exchange: "GPW",
    indices: ["^MWIG40"],
    price: {
      trading_date: "2024-01-15",
      open: 18.50,
      high: 19.20,
      low: 18.30,
      close: 18.90,
      volume: 1200000,
      change: 0.40,
      change_percent: 2.16,
    },
  },
];

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

function generateStockOHLCV(basePrice: number, days: number): StockOHLCV[] {
  const data: StockOHLCV[] = [];
  let currentPrice = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.5) * basePrice * 0.04;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.015;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.015;
    const volume = Math.floor(Math.random() * 5000000) + 500000;

    data.push({
      time: date.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return data;
}

export function getMockStockHistory(symbol: string, period: Period = "1y"): { symbol: string; name: string; data: StockOHLCV[] } {
  const stock = mockStocks.find(s => s.symbol === symbol);
  const basePrice = stock ? stock.price.close : 100;
  const name = stock ? stock.name : symbol;
  const days = periodToDays(period);

  return {
    symbol,
    name,
    data: generateStockOHLCV(basePrice, days),
  };
}
