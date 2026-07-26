import { useQuery } from "@tanstack/react-query";
import { getCurrencyHistory } from "../api/currencyHistory";
import { Period } from "../types/index";

export const useCurrencyHistory = (code: string, period: Period = "1y") => {
  return useQuery({
    queryKey: ["currencyHistory", code, period],
    queryFn: () => getCurrencyHistory(code, period),
    enabled: !!code,
  });
};
