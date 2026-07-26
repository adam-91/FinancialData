import { StockIndex, IndexHistoryResponse, Period } from "../types/index";

export const mockIndices: StockIndex[] = [
  { id: 1, symbol: "^WIG20", name: "WIG 20", stock_exchange: "GPW", active: true },
  { id: 2, symbol: "^WIG", name: "WIG", stock_exchange: "GPW", active: true },
  { id: 3, symbol: "^GSPC", name: "S&P 500", stock_exchange: "NYSE", active: true },
  { id: 4, symbol: "^DJI", name: "Dow Jones", stock_exchange: "NYSE", active: true },
  { id: 5, symbol: "^IXIC", name: "NASDAQ Composite", stock_exchange: "NASDAQ", active: true },
  { id: 6, symbol: "^GDAXI", name: "DAX", stock_exchange: "XETRA", active: true },
  { id: 7, symbol: "^FTSE", name: "FTSE 100", stock_exchange: "LSE", active: true },
  { id: 8, symbol: "^N225", name: "Nikkei 225", stock_exchange: "TSE", active: true },
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

function generateMockOHLCV(basePrice: number, days: number): IndexHistoryResponse["data"] {
  const data = [];
  let currentPrice = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.5) * basePrice * 0.03;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.01;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.01;
    const volume = Math.floor(Math.random() * 100000000) + 50000000;

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

export function getMockIndexHistory(symbol: string, period: Period = "1y"): IndexHistoryResponse {
  const index = mockIndices.find(i => i.symbol === symbol) || mockIndices[0];
  const basePrices: Record<string, number> = {
    "^WIG20": 2450,
    "^WIG": 75000,
    "^GSPC": 5200,
    "^DJI": 39000,
    "^IXIC": 16500,
    "^GDAXI": 18500,
    "^FTSE": 7800,
    "^N225": 38000,
  };

  const basePrice = basePrices[symbol] || 1000;
  const days = periodToDays(period);
  
  return {
    symbol: index.symbol,
    name: index.name,
    data: generateMockOHLCV(basePrice, days),
  };
}
