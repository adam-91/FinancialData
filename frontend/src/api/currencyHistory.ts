import { CurrencyHistoryResponse } from "../mocks/currencyHistory";
import { Period } from "../types/index";
import { getMockCurrencyHistory } from "../mocks/currencyHistory";

export const getCurrencyHistory = async (code: string, period: Period = "1y"): Promise<CurrencyHistoryResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getMockCurrencyHistory(code, period)), 500);
  });
};
