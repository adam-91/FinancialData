import { describe, it, expect } from "vitest";
import { mockStocks } from "../../mocks/stocks";

describe("mockStocks", () => {
  it("should have at least one stock", () => {
    expect(mockStocks.length).toBeGreaterThan(0);
  });

  it("should have required properties for each stock", () => {
    mockStocks.forEach((stock) => {
      expect(stock).toHaveProperty("symbol");
      expect(stock).toHaveProperty("yahoo_symbol");
      expect(stock).toHaveProperty("name");
      expect(stock).toHaveProperty("stock_exchange");
      expect(stock).toHaveProperty("price");

      expect(typeof stock.symbol).toBe("string");
      expect(typeof stock.yahoo_symbol).toBe("string");
      expect(typeof stock.name).toBe("string");
      expect(typeof stock.stock_exchange).toBe("string");
    });
  });

  it("should have price object with required properties", () => {
    mockStocks.forEach((stock) => {
      const { price } = stock;
      expect(price).toHaveProperty("trading_date");
      expect(price).toHaveProperty("open");
      expect(price).toHaveProperty("high");
      expect(price).toHaveProperty("low");
      expect(price).toHaveProperty("close");
      expect(price).toHaveProperty("volume");
      expect(price).toHaveProperty("change");
      expect(price).toHaveProperty("change_percent");

      expect(typeof price.trading_date).toBe("string");
      expect(typeof price.open).toBe("number");
      expect(typeof price.high).toBe("number");
      expect(typeof price.low).toBe("number");
      expect(typeof price.close).toBe("number");
      expect(typeof price.volume).toBe("number");
      expect(typeof price.change).toBe("number");
      expect(typeof price.change_percent).toBe("number");
    });
  });

  it("should have high >= low for all stocks", () => {
    mockStocks.forEach((stock) => {
      expect(stock.price.high).toBeGreaterThanOrEqual(stock.price.low);
    });
  });

  it("should contain CD Projekt stock", () => {
    const cdr = mockStocks.find((s) => s.symbol === "CDR");
    expect(cdr).toBeDefined();
    expect(cdr?.name).toBe("CD Projekt");
    expect(cdr?.stock_exchange).toBe("GPW");
  });

  it("should contain PKN Orlen stock", () => {
    const pkn = mockStocks.find((s) => s.symbol === "PKN");
    expect(pkn).toBeDefined();
    expect(pkn?.name).toBe("PKN Orlen");
  });

  it("should have positive volume for all stocks", () => {
    mockStocks.forEach((stock) => {
      expect(stock.price.volume).toBeGreaterThan(0);
    });
  });
});
