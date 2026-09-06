import { useQuery } from "@tanstack/react-query";
import {
  getCorrelation,
  getDailyChange,
  getMovingAverage,
} from "../api/currencyAnalytics";

export const useDailyChange = (codes: string[]) => {
  return useQuery({
    queryKey: ["currencyDailyChange", codes],
    queryFn: () => getDailyChange(codes),
    enabled: codes.length > 0,
  });
};

export const useMovingAverage = (codes: string[], window: number) => {
  return useQuery({
    queryKey: ["currencyMovingAverage", codes, window],
    queryFn: () => getMovingAverage(codes, window),
    enabled: codes.length > 0,
  });
};

export const useCorrelation = (codes: string[]) => {
  return useQuery({
    queryKey: ["currencyCorrelation", codes],
    queryFn: () => getCorrelation(codes),
    enabled: codes.length > 0,
  });
};
