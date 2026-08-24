export interface ExchangeMidRate {
    id:number;
    currency_id: number;
    effective_date: Date;
    mid: number;
}

export interface ExchangeBuyAndSellRate {
    id:number;
    currency_id: number;
    effective_date: Date;
    bid: number;
    ask: number;
}

export interface ExchangeRate {
  code: string;
  currency: string;
  effectiveDate: string;
  mid: number | null;
  bid: number | null;
  ask: number | null;
}

export interface CurrencySummary {
  code: string;
  currency: string;
  mid: number | null;
  bid: number | null;
  ask: number | null;
  change: number | null;
}
