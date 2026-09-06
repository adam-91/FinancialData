import { describe, it, expect, vi } from "vitest";
import { render } from "../../../test-utils";
import { StockChart } from "../../../components/chart/StockChart";
import { IndexOHLCV } from "../../../types/index";

const { setDataCalls } = vi.hoisted(() => ({
  setDataCalls: [] as ReturnType<typeof vi.fn>[],
}));

vi.mock("lightweight-charts", () => ({
  createChart: vi.fn(() => ({
    addSeries: vi.fn(() => {
      const setData = vi.fn();
      setDataCalls.push(setData);
      return { setData };
    }),
    removeSeries: vi.fn(),
    remove: vi.fn(),
    applyOptions: vi.fn(),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn(),
    })),
  })),
  ColorType: {
    Solid: "solid",
  },
  CandlestickSeries: "CandlestickSeries",
  LineSeries: "LineSeries",
}));

const mockData: IndexOHLCV[] = [
  {
    time: "2024-01-02",
    open: 2450.12,
    high: 2475.89,
    low: 2440.5,
    close: 2468.33,
    volume: 125000000,
  },
  {
    time: "2024-01-03",
    open: 2468.33,
    high: 2480.15,
    low: 2455.2,
    close: 2472.45,
    volume: 118000000,
  },
];

describe("StockChart", () => {
  it("should render without errors", () => {
    const { container } = render(
      <StockChart data={mockData} chartType="candlestick" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render chart container", () => {
    const { container } = render(
      <StockChart data={mockData} chartType="candlestick" />
    );
    const chartDiv = container.firstChild;
    expect(chartDiv).toBeInTheDocument();
  });

  it("should accept candlestick chart type", () => {
    const { container } = render(
      <StockChart data={mockData} chartType="candlestick" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should accept line chart type", () => {
    const { container } = render(
      <StockChart data={mockData} chartType="line" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render with empty data", () => {
    const { container } = render(
      <StockChart data={[]} chartType="candlestick" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should coerce string OHLC values to numbers for candlestick", () => {
    setDataCalls.length = 0;
    const stringData = mockData.map((d) => ({
      ...d,
      open: String(d.open),
      high: String(d.high),
      low: String(d.low),
      close: String(d.close),
    })) as unknown as IndexOHLCV[];

    render(<StockChart data={stringData} chartType="candlestick" />);

    const data = setDataCalls[0]?.mock.calls[0][0];
    expect(data).toBeDefined();
    expect(typeof data[0].open).toBe("number");
    expect(typeof data[0].high).toBe("number");
    expect(typeof data[0].low).toBe("number");
    expect(typeof data[0].close).toBe("number");
    expect(data[0].open).toBe(2450.12);
  });

  it("should coerce string close value to number for line chart", () => {
    setDataCalls.length = 0;
    const stringData = mockData.map((d) => ({
      ...d,
      close: String(d.close),
    })) as unknown as IndexOHLCV[];

    render(<StockChart data={stringData} chartType="line" />);

    const data = setDataCalls[0]?.mock.calls[0][0];
    expect(data).toBeDefined();
    expect(typeof data[0].value).toBe("number");
    expect(data[0].value).toBe(2468.33);
  });
});
