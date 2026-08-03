import { useQuery } from "@tanstack/react-query";
import { getRawData, RawDataResponse } from "../api/dataHealth";

export const useRawData = (
  entityType: string,
  symbol: string,
  page: number = 1,
  pageSize: number = 50
) => {
  return useQuery<RawDataResponse>({
    queryKey: ["rawData", entityType, symbol, page, pageSize],
    queryFn: () => getRawData(entityType, symbol, page, pageSize),
    enabled: !!entityType && !!symbol,
  });
};
