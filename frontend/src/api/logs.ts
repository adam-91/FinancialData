import api from "./config";

export interface LogEntry {
  timestamp: string;
  level: string;
  logger_name: string;
  event: string;
  extra: Record<string, unknown>;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface LogsQueryParams {
  page?: number;
  page_size?: number;
  level?: string;
  module?: string;
  search?: string;
  sort_by?: "timestamp" | "level" | "module";
  sort_order?: "asc" | "desc";
}

export async function fetchLogs(
  params: LogsQueryParams = {}
): Promise<LogsResponse> {
  const response = await api.get<LogsResponse>("/api/logs", { params });
  return response.data;
}
