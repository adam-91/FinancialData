import api from "./config";

export interface ExchangeOption {
  id: number;
  symbol: string;
  name: string;
  ticker: string | null;
}

export interface AdminCompany {
  id: number;
  symbol: string;
  yahoo_symbol: string;
  name: string;
  exchange_id: number;
  active: boolean;
}

export interface AdminIndex {
  id: number;
  symbol: string;
  name: string;
  active: boolean;
  stock_exchange_id: number;
}

export interface YfinanceTestResult {
  symbol: string;
  found: boolean;
  last_close: number | null;
  last_date: string | null;
  error: string | null;
}

export async function listExchanges(): Promise<ExchangeOption[]> {
  const response = await api.get<ExchangeOption[]>("/api/admin/exchanges");
  return response.data;
}

export async function listTickers(): Promise<AdminCompany[]> {
  const response = await api.get<AdminCompany[]>("/api/admin/tickers");
  return response.data;
}

export async function createTicker(
  data: {
    symbol: string;
    name: string;
    exchange_symbol: string;
    yahoo_symbol?: string;
    auto_fetch?: boolean;
  },
  force = false
): Promise<AdminCompany> {
  const response = await api.post<AdminCompany>("/api/admin/tickers", data, {
    params: { force },
  });
  return response.data;
}

export async function listIndices(): Promise<AdminIndex[]> {
  const response = await api.get<AdminIndex[]>("/api/admin/indices");
  return response.data;
}

export async function createIndex(
  data: {
    symbol: string;
    name: string;
    exchange_symbol: string;
    auto_fetch?: boolean;
  },
  force = false
): Promise<AdminIndex> {
  const response = await api.post<AdminIndex>("/api/admin/indices", data, {
    params: { force },
  });
  return response.data;
}

export async function testYfinance(symbol: string): Promise<YfinanceTestResult> {
  const response = await api.post<YfinanceTestResult>("/api/admin/yfinance/test", {
    symbol,
  });
  return response.data;
}

export async function refreshCompaniesData(): Promise<{ status: string }> {
  const response = await api.post<{ status: string }>(
    "/api/admin/data/refresh/companies"
  );
  return response.data;
}

export async function refreshIndicesData(): Promise<{ status: string }> {
  const response = await api.post<{ status: string }>(
    "/api/admin/data/refresh/indices"
  );
  return response.data;
}
