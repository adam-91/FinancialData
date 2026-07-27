import { StockCompany, StockHistoryResponse } from "../types/stock";
import { Period } from "../types/index";
import { mockStocks, getMockStockHistory } from "../mocks/stocks";
import api, { isMockMode } from "./config";

export const getStockPrices = async (): Promise<StockCompany[]> => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStocks), 300);
    });
  }
  const response = await api.get<StockCompany[]>("/api/stocks/prices/");
  return response.data;
};

export const getStockHistory = async (symbol: string, period: Period = "1y"): Promise<StockHistoryResponse> => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockStockHistory(symbol, period)), 500);
    });
  }
  const response = await api.get<StockHistoryResponse>(`/api/stocks/prices/${encodeURIComponent(symbol)}/history`, {
    params: { period },
  });
  return response.data;
};
