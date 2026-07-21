import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test-utils";
import { ChartControls } from "../../../components/chart/ChartControls";
import { StockIndex } from "../../../types/index";
import i18n from "../../../i18n";

const mockIndices: StockIndex[] = [
  { id: 1, symbol: "^WIG20", name: "WIG 20", stock_exchange: "GPW", active: true },
  { id: 2, symbol: "^GSPC", name: "S&P 500", stock_exchange: "NYSE", active: true },
  { id: 3, symbol: "^DJI", name: "Dow Jones", stock_exchange: "NYSE", active: true },
];

describe("ChartControls", () => {
  const defaultProps = {
    indices: mockIndices,
    selectedSymbol: "^WIG20",
    chartType: "candlestick" as const,
    onSymbolChange: vi.fn(),
    onChartTypeChange: vi.fn(),
  };

  beforeEach(async () => {
    await i18n.changeLanguage("pl");
  });

  it("should render without errors", () => {
    render(<ChartControls {...defaultProps} />);
    expect(screen.getByText("Wybierz indeks")).toBeInTheDocument();
  });

  it("should display all indices in select", () => {
    render(<ChartControls {...defaultProps} />);
    expect(screen.getByText("WIG 20 (GPW)")).toBeInTheDocument();
    expect(screen.getByText("S&P 500 (NYSE)")).toBeInTheDocument();
    expect(screen.getByText("Dow Jones (NYSE)")).toBeInTheDocument();
  });

  it("should have correct selected value", () => {
    render(<ChartControls {...defaultProps} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("^WIG20");
  });

  it("should call onSymbolChange when selection changes", () => {
    const onSymbolChange = vi.fn();
    render(
      <ChartControls {...defaultProps} onSymbolChange={onSymbolChange} />
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "^GSPC" } });
    expect(onSymbolChange).toHaveBeenCalledWith("^GSPC");
  });

  it("should render candlestick and line toggle buttons", () => {
    render(<ChartControls {...defaultProps} />);
    expect(screen.getByText("Świecowy")).toBeInTheDocument();
    expect(screen.getByText("Liniowy")).toBeInTheDocument();
  });

  it("should call onChartTypeChange with candlestick", () => {
    const onChartTypeChange = vi.fn();
    render(
      <ChartControls {...defaultProps} onChartTypeChange={onChartTypeChange} />
    );
    fireEvent.click(screen.getByText("Świecowy"));
    expect(onChartTypeChange).toHaveBeenCalledWith("candlestick");
  });

  it("should call onChartTypeChange with line", () => {
    const onChartTypeChange = vi.fn();
    render(
      <ChartControls {...defaultProps} onChartTypeChange={onChartTypeChange} />
    );
    fireEvent.click(screen.getByText("Liniowy"));
    expect(onChartTypeChange).toHaveBeenCalledWith("line");
  });

  it("should display English labels when language is English", async () => {
    await i18n.changeLanguage("en");
    render(<ChartControls {...defaultProps} />);
    expect(screen.getByText("Select index")).toBeInTheDocument();
    expect(screen.getByText("Candlestick")).toBeInTheDocument();
    expect(screen.getByText("Line")).toBeInTheDocument();
  });
});
