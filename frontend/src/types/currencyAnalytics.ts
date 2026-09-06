export interface DailyChangePoint {
  date: string;
  change: number;
}

export interface DailyChangeSeries {
  code: string;
  currency: string;
  data: DailyChangePoint[];
}

export interface MovingAveragePoint {
  date: string;
  value: number;
  ma: number | null;
}

export interface TrendInfo {
  direction: "up" | "down" | "flat";
  percent: number;
}

export interface MovingAverageSeries {
  code: string;
  currency: string;
  data: MovingAveragePoint[];
  trend: TrendInfo;
}

export interface CorrelationResponse {
  codes: string[];
  values: number[][];
}
