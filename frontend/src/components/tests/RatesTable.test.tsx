import { render, screen } from "@testing-library/react";
import { RatesTable } from "../RatesTable";

describe("RatesTable", () => {
  it("renders exchange rates", () => {
    render(
      <RatesTable
        currencies={[]}
        rates={[
          {
            code: "USD",
            currency: "US Dollar",
            effectiveDate: "2025-01-01",
            mid: 4.1234,
            bid: 4.01,
            ask: 4.2,
          },
        ]}
      />
    );

    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("US Dollar")).toBeInTheDocument();
    expect(screen.getByText("4.1234")).toBeInTheDocument();
    expect(screen.getByText("4.0100")).toBeInTheDocument();
    expect(screen.getByText("4.2000")).toBeInTheDocument();
  });

  it("renders dash when rates are null", () => {
    render(
      <RatesTable
        currencies={[]}
        rates={[
          {
            code: "EUR",
            currency: "Euro",
            effectiveDate: "2025-01-01",
            mid: null,
            bid: null,
            ask: null,
          },
        ]}
      />
    );

    expect(screen.getAllByText("-")).toHaveLength(3);
  });

  it("renders empty table when rates missing", () => {
    render(
      <RatesTable
        currencies={[]}
        rates={null}
      />
    );

    expect(screen.getByText("Code")).toBeInTheDocument();
  });
});