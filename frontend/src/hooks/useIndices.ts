import { useQuery } from "@tanstack/react-query";
import { getIndices, getIndexHistory } from "../api/indices";
import { Period } from "../types/index";

export const useIndices = () => {
  return useQuery({
    queryKey: ["indices"],
    queryFn: getIndices,
  });
};

export const useIndexHistory = (symbol: string, period: Period = "1y") => {
  return useQuery({
    queryKey: ["indexHistory", symbol, period],
    queryFn: () => getIndexHistory(symbol, period),
    enabled: !!symbol,
  });
};
