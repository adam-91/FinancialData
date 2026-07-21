import { useQuery } from "@tanstack/react-query";
import { getStockPrices } from "../api/stocks";

export const useStockPrices = () => {
  return useQuery({
    queryKey: ["stockPrices"],
    queryFn: getStockPrices,
  });
};
