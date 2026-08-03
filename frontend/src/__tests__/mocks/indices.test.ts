import { describe, it, expect } from "vitest";
import { mockIndices, getMockIndexHistory } from "../../mocks/indices";

describe("mockIndices", () => {
  it("should have at least one index", () => {
    expect(mockIndices.length).toBeGreaterThan(0);
  });

  it("should have required properties for each index", () => {
    mockIndices.forEach((index) => {
      expect(index).toHaveProperty("id");
      expect(index).toHaveProperty("symbol");
      expect(index).toHaveProperty("name");
      expect(index).toHaveProperty("stock_exchange");
      expect(index).toHaveProperty("active");
      expect(typeof index.id).toBe("number");
      expect(typeof index.symbol).toBe("string");
      expect(typeof index.name).toBe("string");
      expect(typeof index.stock_exchange).toBe("string");
      expect(typeof index.active).toBe("boolean");
    });
  });

  it("should contain WIG20 index", () => {
    const wig20 = mockIndices.find((i) => i.symbol === "^WIG20");
    expect(wig20).toBeDefined();
    expect(wig20?.name).toBe("WIG 20");
  });

  it("should contain S&P 500 index", () => {
    const sp500 = mockIndices.find((i) => i.symbol === "^GSPC");
    expect(sp500).toBeDefined();
    expect(sp500?.name).toBe("S&P 500");
  });
});

describe("getMockIndexHistory", () => {
  it("should return history for valid symbol", () => {
    const history = getMockIndexHistory("^WIG20");
    expect(history).toBeDefined();
    expect(history.symbol).toBe("^WIG20");
    expect(history.name).toBe("WIG 20");
    expect(history.data).toBeDefined();
    expect(Array.isArray(history.data)).toBe(true);
  });

  it("should return data with OHLCV structure", () => {
    const history = getMockIndexHistory("^WIG20");
    expect(history.data.length).toBeGreaterThan(0);

    const firstEntry = history.data[0];
    expect(firstEntry).toHaveProperty("time");
    expect(firstEntry).toHaveProperty("open");
    expect(firstEntry).toHaveProperty("high");
    expect(firstEntry).toHaveProperty("low");
    expect(firstEntry).toHaveProperty("close");
    expect(firstEntry).toHaveProperty("volume");

    expect(typeof firstEntry.time).toBe("string");
    expect(typeof firstEntry.open).toBe("number");
    expect(typeof firstEntry.high).toBe("number");
    expect(typeof firstEntry.low).toBe("number");
    expect(typeof firstEntry.close).toBe("number");
    expect(typeof firstEntry.volume).toBe("number");
  });

  it("should have high >= low for all entries", () => {
    const history = getMockIndexHistory("^GSPC");
    history.data.forEach((entry) => {
      expect(entry.high).toBeGreaterThanOrEqual(entry.low);
    });
  });

  it("should have high >= open and close", () => {
    const history = getMockIndexHistory("^DJI");
    history.data.forEach((entry) => {
      expect(entry.high).toBeGreaterThanOrEqual(entry.open);
      expect(entry.high).toBeGreaterThanOrEqual(entry.close);
    });
  });

  it("should have low <= open and close", () => {
    const history = getMockIndexHistory("^IXIC");
    history.data.forEach((entry) => {
      expect(entry.low).toBeLessThanOrEqual(entry.open);
      expect(entry.low).toBeLessThanOrEqual(entry.close);
    });
  });

  it("should not include weekends", () => {
    const history = getMockIndexHistory("^WIG20");
    history.data.forEach((entry) => {
      const date = new Date(entry.time);
      const dayOfWeek = date.getDay();
      expect(dayOfWeek).not.toBe(0);
      expect(dayOfWeek).not.toBe(6);
    });
  });

  it("should return default index for unknown symbol", () => {
    const history = getMockIndexHistory("^UNKNOWN");
    expect(history.symbol).toBe("^WIG20");
    expect(history.data.length).toBeGreaterThan(0);
  });
});
