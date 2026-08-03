import { useQuery } from "@tanstack/react-query";
import { getStockPrices, getStockHistory } from "../api/stocks";
import { Period } from "../types/index";

export const useStockPrices = () => {
  return useQuery({
    queryKey: ["stockPrices"],
    queryFn: getStockPrices,
  });
};

export const useStockHistory = (symbol: string, period: Period = "1y") => {
  return useQuery({
    queryKey: ["stockHistory", symbol, period],
    queryFn: () => getStockHistory(symbol, period),
    enabled: !!symbol,
  });
};
