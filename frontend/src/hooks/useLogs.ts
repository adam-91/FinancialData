import { useQuery } from "@tanstack/react-query";
import { fetchLogs, LogsQueryParams } from "../api/logs";

export function useLogs(params: LogsQueryParams = {}) {
  return useQuery({
    queryKey: ["logs", params],
    queryFn: () => fetchLogs(params),
    refetchInterval: 30000,
  });
}
