import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "../../../test-utils";
import { CurrencyTable } from "../../../components/tables/CurrencyTable";
import { ExchangeRate } from "../../../types/currencyExchangeRate";
import i18n from "../../../i18n";

const mockRates: ExchangeRate[] = [
  {
    code: "USD",
    currency: "dolar amerykański",
    effectiveDate: "2024-01-15",
    mid: 3.9562,
    bid: 3.92,
    ask: 3.99,
  },
  {
    code: "EUR",
    currency: "euro",
    effectiveDate: "2024-01-15",
    mid: 4.3215,
    bid: 4.28,
    ask: 4.36,
  },
  {
    code: "GBP",
    currency: "funt szterling",
    effectiveDate: "2024-01-15",
    mid: 5.0123,
    bid: 4.96,
    ask: 5.06,
  },
];

describe("CurrencyTable", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("pl");
  });

  it("should render without errors", () => {
    render(<CurrencyTable rates={mockRates} />);
    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("should display table headers in Polish", () => {
    render(<CurrencyTable rates={mockRates} />);
    expect(screen.getByText("Kod")).toBeInTheDocument();
    expect(screen.getByText("Waluta")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Kurs średni")).toBeInTheDocument();
    expect(screen.getByText("Kupno")).toBeInTheDocument();
    expect(screen.getByText("Sprzedaż")).toBeInTheDocument();
  });

  it("should display table headers in English", async () => {
    await i18n.changeLanguage("en");
    render(<CurrencyTable rates={mockRates} />);
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("Currency")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Mid Rate")).toBeInTheDocument();
    expect(screen.getByText("Buy Rate")).toBeInTheDocument();
    expect(screen.getByText("Sell Rate")).toBeInTheDocument();
  });

  it("should display currency codes", () => {
    render(<CurrencyTable rates={mockRates} />);
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
    expect(screen.getByText("GBP")).toBeInTheDocument();
  });

  it("should display currency names", () => {
    render(<CurrencyTable rates={mockRates} />);
    expect(screen.getByText("dolar amerykański")).toBeInTheDocument();
    expect(screen.getByText("euro")).toBeInTheDocument();
    expect(screen.getByText("funt szterling")).toBeInTheDocument();
  });

  it("should display dates", () => {
    render(<CurrencyTable rates={mockRates} />);
    const dates = screen.getAllByText("2024-01-15");
    expect(dates.length).toBe(3);
  });

  it("should format mid rate with 4 decimal places", () => {
    render(<CurrencyTable rates={mockRates} />);
    expect(screen.getByText("3.9562")).toBeInTheDocument();
    expect(screen.getByText("4.3215")).toBeInTheDocument();
    expect(screen.getByText("5.0123")).toBeInTheDocument();
  });

  it("should format buy rate with 4 decimal places", () => {
    render(<CurrencyTable rates={mockRates} />);
    expect(screen.getByText("3.9200")).toBeInTheDocument();
    expect(screen.getByText("4.2800")).toBeInTheDocument();
    expect(screen.getByText("4.9600")).toBeInTheDocument();
  });

  it("should format sell rate with 4 decimal places", () => {
    render(<CurrencyTable rates={mockRates} />);
    expect(screen.getByText("3.9900")).toBeInTheDocument();
    expect(screen.getByText("4.3600")).toBeInTheDocument();
    expect(screen.getByText("5.0600")).toBeInTheDocument();
  });

  it("should display dash for null rates", () => {
    const ratesWithNull: ExchangeRate[] = [
      {
        code: "USD",
        currency: "dolar amerykański",
        effectiveDate: "2024-01-15",
        mid: null,
        bid: null,
        ask: null,
      },
    ];
    render(<CurrencyTable rates={ratesWithNull} />);
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBe(3);
  });

  it("should render empty table when rates is null", () => {
    render(<CurrencyTable rates={null} />);
    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("should render empty table when rates is empty", () => {
    render(<CurrencyTable rates={[]} />);
    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });
});
