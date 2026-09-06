import axios from "axios";
import {
  CorrelationResponse,
  DailyChangeSeries,
  MovingAverageSeries,
} from "../types/currencyAnalytics";

const api = axios.create({
  baseURL: "http://localhost:8001",
});

export const getDailyChange = async (
  codes: string[],
): Promise<DailyChangeSeries[]> => {
  const response = await api.get<DailyChangeSeries[]>(
    "/api/currencies/analytics/daily-change",
    { params: { codes: codes.join(",") } },
  );
  return response.data;
};

export const getMovingAverage = async (
  codes: string[],
  window: number,
): Promise<MovingAverageSeries[]> => {
  const response = await api.get<MovingAverageSeries[]>(
    "/api/currencies/analytics/moving-average",
    { params: { codes: codes.join(","), window } },
  );
  return response.data;
};

export const getCorrelation = async (
  codes: string[],
): Promise<CorrelationResponse> => {
  const response = await api.get<CorrelationResponse>(
    "/api/currencies/analytics/correlation",
    { params: { codes: codes.join(",") } },
  );
  return response.data;
};
