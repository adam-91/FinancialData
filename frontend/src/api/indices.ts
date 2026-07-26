import { StockIndex, IndexHistoryResponse, Period } from "../types/index";
import { mockIndices, getMockIndexHistory } from "../mocks/indices";

export const getIndices = async (): Promise<StockIndex[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockIndices), 300);
  });
};

export const getIndexHistory = async (symbol: string, period: Period = "1y"): Promise<IndexHistoryResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getMockIndexHistory(symbol, period)), 500);
  });
};
