import { StockCompany, StockHistoryResponse } from "../types/stock";
import { Period } from "../types/index";
import { mockStocks, getMockStockHistory } from "../mocks/stocks";

export const getStockPrices = async (): Promise<StockCompany[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockStocks), 300);
  });
};

export const getStockHistory = async (symbol: string, period: Period = "1y"): Promise<StockHistoryResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getMockStockHistory(symbol, period)), 500);
  });
};
