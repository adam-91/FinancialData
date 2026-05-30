import { useQuery } from "@tanstack/react-query";
import { getMidRates, getBASRates, getRates} from "../api/rates";

export const useMidRates = () => {
  return useQuery({
    queryKey: ["rates"],
    queryFn: getMidRates,
  });
};

export const useBASRates = () => {
  return useQuery({
    queryKey: ["rates"],
    queryFn: getBASRates,
  });
};

export const useRates = () => {
  return useQuery({
    queryKey: ["rates"],
    queryFn: getRates,
  });
};

