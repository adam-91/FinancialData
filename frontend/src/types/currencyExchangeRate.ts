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
    id: number;
    currency_id: number;
    effective_date: Date;
    bid: number;
    ask: number;
    mid: number;
}