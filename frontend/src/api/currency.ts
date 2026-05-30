import axios from "axios";
import { CurrencyRate } from "../types/currencyRate";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getCurrencies =  async (): Promise<CurrencyRate[]> => {
  const response = await api.get<CurrencyRate[]>("/currencies");
  return response.data;
};

export const getCurrency =  async (): Promise<CurrencyRate[]> => {
  const response = await api.get<CurrencyRate[]>("/currency");
  return response.data;
};