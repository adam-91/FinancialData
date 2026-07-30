import api from "./config";

export interface DataHealthSummary {
  total_indices: number;
  indices_with_data: number;
  indices_percent: number;
  total_companies: number;
  companies_with_data: number;
  companies_percent: number;
}

export interface EntityHealthDetail {
  symbol: string;
  name: string;
  min_date: string | null;
  max_date: string | null;
  record_count: number;
}

export interface RawDataEntry {
  trading_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RawDataResponse {
  symbol: string;
  name: string;
  total: number;
  page: number;
  page_size: number;
  data: RawDataEntry[];
}

export const getDataHealthSummary = async (): Promise<DataHealthSummary> => {
  const response = await api.get<DataHealthSummary>("/api/health/data/summary");
  return response.data;
};

export const getAllIndicesHealth = async (): Promise<EntityHealthDetail[]> => {
  const response = await api.get<EntityHealthDetail[]>("/api/health/data/indices");
  return response.data;
};

export const getIndexHealth = async (symbol: string): Promise<EntityHealthDetail> => {
  const response = await api.get<EntityHealthDetail>(`/api/health/data/indices/${encodeURIComponent(symbol)}`);
  return response.data;
};

export const getAllCompaniesHealth = async (): Promise<EntityHealthDetail[]> => {
  const response = await api.get<EntityHealthDetail[]>("/api/health/data/companies");
  return response.data;
};

export const getCompanyHealth = async (symbol: string): Promise<EntityHealthDetail> => {
  const response = await api.get<EntityHealthDetail>(`/api/health/data/companies/${encodeURIComponent(symbol)}`);
  return response.data;
};

export const getRawData = async (
  entityType: string,
  symbol: string,
  page: number = 1,
  pageSize: number = 50
): Promise<RawDataResponse> => {
  const response = await api.get<RawDataResponse>(
    `/api/health/data/raw/${entityType}/${encodeURIComponent(symbol)}`,
    { params: { page, page_size: pageSize } }
  );
  return response.data;
};
