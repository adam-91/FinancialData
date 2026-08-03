import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "../../../test-utils";
import { StockTable } from "../../../components/tables/StockTable";
import { StockCompany } from "../../../types/stock";
import i18n from "../../../i18n";

const mockStocks: StockCompany[] = [
  {
    symbol: "CDR",
    yahoo_symbol: "CDR.WA",
    name: "CD Projekt",
    stock_exchange: "GPW",
    indices: ["^WIG20"],
    price: {
      trading_date: "2024-01-15",
      open: 185.5,
      high: 188.9,
      low: 184.2,
      close: 187.3,
      volume: 2500000,
      change: 1.8,
      change_percent: 0.97,
    },
  },
  {
    symbol: "PKN",
    yahoo_symbol: "PKN.WA",
    name: "PKN Orlen",
    stock_exchange: "GPW",
    indices: ["^WIG20"],
    price: {
      trading_date: "2024-01-15",
      open: 72.1,
      high: 73.45,
      low: 71.8,
      close: 72.95,
      volume: 3200000,
      change: 0.85,
      change_percent: 1.18,
    },
  },
  {
    symbol: "JSW",
    yahoo_symbol: "JSW.WA",
    name: "JSW",
    stock_exchange: "GPW",
    indices: ["^WIG20"],
    price: {
      trading_date: "2024-01-15",
      open: 28.9,
      high: 29.5,
      low: 28.6,
      close: 29.2,
      volume: 1900000,
      change: -0.3,
      change_percent: -1.04,
    },
  },
];

describe("StockTable", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("pl");
  });

  it("should render without errors", () => {
    render(<StockTable stocks={mockStocks} />);
    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("should display table headers in Polish", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("Symbol")).toBeInTheDocument();
    expect(screen.getByText("Nazwa")).toBeInTheDocument();
    expect(screen.getByText("Giełda")).toBeInTheDocument();
    expect(screen.getByText("Cena")).toBeInTheDocument();
    expect(screen.getByText("Zmiana")).toBeInTheDocument();
    expect(screen.getByText("Zmiana %")).toBeInTheDocument();
    expect(screen.getByText("Wolumen")).toBeInTheDocument();
  });

  it("should display table headers in English", async () => {
    await i18n.changeLanguage("en");
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Exchange")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Change")).toBeInTheDocument();
    expect(screen.getByText("Change %")).toBeInTheDocument();
    expect(screen.getByText("Volume")).toBeInTheDocument();
  });

  it("should display stock symbols", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("CDR")).toBeInTheDocument();
    expect(screen.getByText("PKN")).toBeInTheDocument();
    const jswElements = screen.getAllByText("JSW");
    expect(jswElements.length).toBeGreaterThan(0);
  });

  it("should display stock names", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("CD Projekt")).toBeInTheDocument();
    expect(screen.getByText("PKN Orlen")).toBeInTheDocument();
  });

  it("should display stock exchange", () => {
    render(<StockTable stocks={mockStocks} />);
    const gpwCells = screen.getAllByText("GPW");
    expect(gpwCells.length).toBe(3);
  });

  it("should display close prices with 2 decimal places", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("187.30")).toBeInTheDocument();
    expect(screen.getByText("72.95")).toBeInTheDocument();
    expect(screen.getByText("29.20")).toBeInTheDocument();
  });

  it("should display positive change with + prefix", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("+1.80")).toBeInTheDocument();
    expect(screen.getByText("+0.85")).toBeInTheDocument();
  });

  it("should display negative change", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("-0.30")).toBeInTheDocument();
  });

  it("should display positive change percent with + prefix", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("+0.97%")).toBeInTheDocument();
    expect(screen.getByText("+1.18%")).toBeInTheDocument();
  });

  it("should display negative change percent", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("-1.04%")).toBeInTheDocument();
  });

  it("should format volume in millions", () => {
    render(<StockTable stocks={mockStocks} />);
    expect(screen.getByText("2.50M")).toBeInTheDocument();
    expect(screen.getByText("3.20M")).toBeInTheDocument();
    expect(screen.getByText("1.90M")).toBeInTheDocument();
  });

  it("should render empty table when stocks is empty", () => {
    render(<StockTable stocks={[]} />);
    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });
});
