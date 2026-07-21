import { StockCompany } from "../types/stock";
import { mockStocks } from "../mocks/stocks";

export const getStockPrices = async (): Promise<StockCompany[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockStocks), 300);
  });
};
