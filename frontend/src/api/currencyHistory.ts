import { CurrencyHistoryResponse } from "../mocks/currencyHistory";
import { Period } from "../types/index";
import { getMockCurrencyHistory } from "../mocks/currencyHistory";
import api, { isMockMode } from "./config";

export const getCurrencyHistory = async (code: string, period: Period = "1y"): Promise<CurrencyHistoryResponse> => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockCurrencyHistory(code, period)), 500);
    });
  }
  const response = await api.get<CurrencyHistoryResponse>(`/api/currencies/${encodeURIComponent(code)}/history`, {
    params: { period },
  });
  return response.data;
};
