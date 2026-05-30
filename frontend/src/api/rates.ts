import axios from "axios";
import { ExchangeMidRate, ExchangeBuyAndSellRate,  ExchangeRate} from "../types/currencyExchangeRate";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getMidRates = async (): Promise<ExchangeMidRate[]> => {
  const response = await api.get<ExchangeMidRate[]>("/rates");
  return response.data;
};

export const getBASRates = async (): Promise<ExchangeBuyAndSellRate[]> => {
  const response = await api.get<ExchangeBuyAndSellRate[]>("/rates");
  return response.data;
};

export const getRates = async (): Promise<ExchangeRate[]> => {
  const response = await api.get<ExchangeRate[]>("/rates");
  return response.data;
};
