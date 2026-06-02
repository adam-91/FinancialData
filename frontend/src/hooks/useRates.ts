import { useQuery } from "@tanstack/react-query";
import { getRate, getRates } from "../api/rates";
 
export const useRate = (code: string) => {
  return useQuery({
    queryKey: ["rate", code],
    queryFn: () => getRate(code),
    enabled: !!code,
  });
};


export const useRates = () => {
  return useQuery({
    queryKey: ["rates"],
    queryFn: () => getRates()
  });
};
