import { describe, it, expect, vi } from "vitest";
import { render } from "../../../test-utils";
import { StockChart } from "../../../components/chart/StockChart";
import { IndexOHLCV } from "../../../types/index";

vi.mock("lightweight-charts", () => ({
  createChart: vi.fn(() => ({
    addSeries: vi.fn(() => ({
      setData: vi.fn(),
    })),
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
});
