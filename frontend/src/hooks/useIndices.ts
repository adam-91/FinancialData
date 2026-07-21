import { useQuery } from "@tanstack/react-query";
import { getIndices, getIndexHistory } from "../api/indices";

export const useIndices = () => {
  return useQuery({
    queryKey: ["indices"],
    queryFn: getIndices,
  });
};

export const useIndexHistory = (symbol: string) => {
  return useQuery({
    queryKey: ["indexHistory", symbol],
    queryFn: () => getIndexHistory(symbol),
    enabled: !!symbol,
  });
};
