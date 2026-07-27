import { StockIndex, IndexHistoryResponse, Period } from "../types/index";
import { mockIndices, getMockIndexHistory } from "../mocks/indices";
import api, { isMockMode } from "./config";

export const getIndices = async (): Promise<StockIndex[]> => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockIndices), 300);
    });
  }
  const response = await api.get<StockIndex[]>("/api/indices/");
  return response.data;
};

export const getIndexHistory = async (symbol: string, period: Period = "1y"): Promise<IndexHistoryResponse> => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockIndexHistory(symbol, period)), 500);
    });
  }
  const response = await api.get<IndexHistoryResponse>(`/api/indices/${encodeURIComponent(symbol)}/history`, {
    params: { period },
  });
  return response.data;
};
