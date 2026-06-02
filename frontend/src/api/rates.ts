import axios from "axios";
import { ExchangeRate } from "../types/currencyExchangeRate";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getRate = async (
  code: string
): Promise<ExchangeRate> => {
  const response = await api.get<ExchangeRate>(
    `/api/rates/${code}`
  );

  return response.data;
};

export const getRates = async (): Promise<ExchangeRate[]> => {
  const response = await api.get<ExchangeRate[]>('/api/rates/all');
  return response.data;
};
export const getHistoricalRate = async (
  code: string,
  date: string
): Promise<ExchangeRate> => {
  const response = await api.get<ExchangeRate>(
    `/api/rates/history/${code}/date/${date}`
  );

  return response.data;
};