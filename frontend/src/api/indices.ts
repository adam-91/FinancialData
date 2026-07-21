import { StockIndex, IndexHistoryResponse } from "../types/index";
import { mockIndices, getMockIndexHistory } from "../mocks/indices";

export const getIndices = async (): Promise<StockIndex[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockIndices), 300);
  });
};

export const getIndexHistory = async (symbol: string): Promise<IndexHistoryResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getMockIndexHistory(symbol)), 500);
  });
};
