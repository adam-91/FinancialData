export type Period = "1w" | "3m" | "1y" | "3y" | "10y" | "max";

export interface StockIndex {
  id: number;
  symbol: string;
  name: string;
  stock_exchange: string;
  active: boolean;
}

export interface IndexOHLCV {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndexHistoryResponse {
  symbol: string;
  name: string;
  data: IndexOHLCV[];
}
