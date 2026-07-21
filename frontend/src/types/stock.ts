export interface StockPrice {
  trading_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  change_percent: number;
}

export interface StockCompany {
  symbol: string;
  yahoo_symbol: string;
  name: string;
  stock_exchange: string;
  indices: string[];
  price: StockPrice;
}

export interface StockOHLCV {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistoryResponse {
  symbol: string;
  name: string;
  data: StockOHLCV[];
}
