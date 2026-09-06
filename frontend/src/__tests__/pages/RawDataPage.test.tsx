import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../test-utils";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RawDataPage } from "../../pages/RawDataPage";
import { useRawData } from "../../hooks/useRawData";

vi.mock("../../hooks/useRawData", () => ({
  useRawData: vi.fn(),
}));

const mockedUseRawData = vi.mocked(useRawData);

function makeData(page: number) {
  return {
    symbol: "^WIG20",
    name: "WIG20",
    total: 120,
    page,
    page_size: 50,
    data: [
      {
        trading_date: "2026-01-02",
        open: "123.4567",
        high: "125.5",
        low: "120.25",
        close: "124.9",
        volume: 1000,
      },
    ],
  };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/raw-data/index/%5EWIG20"]}>
      <Routes>
        <Route path="/raw-data/:entityType/:symbol" element={<RawDataPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockedUseRawData.mockReset();
  mockedUseRawData.mockReturnValue({
    data: makeData(1),
    isLoading: false,
    error: null,
  });
});

describe("RawDataPage", () => {
  it("renders OHLC values when backend returns them as strings", () => {
    renderPage();

    expect(screen.getByText("123.4567")).toBeTruthy();
    expect(screen.getByText("125.5000")).toBeTruthy();
    expect(screen.getByText("120.2500")).toBeTruthy();
    expect(screen.getByText("124.9000")).toBeTruthy();
  });

  it("renders symbol and name in the title", () => {
    renderPage();
    expect(screen.getByText(/WIG20/)).toBeTruthy();
  });

  it("navigates to a typed page via the Go button", () => {
    renderPage();

    const input = screen.getByLabelText("Go to page");
    fireEvent.change(input, { target: { value: "2" } });
    fireEvent.click(screen.getByText("Go"));

    expect(mockedUseRawData).toHaveBeenLastCalledWith(
      "index",
      "^WIG20",
      2,
      50
    );
  });

  it("navigates to a typed page via Enter", () => {
    renderPage();

    const input = screen.getByLabelText("Go to page");
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockedUseRawData).toHaveBeenLastCalledWith(
      "index",
      "^WIG20",
      3,
      50
    );
  });

  it("clamps out-of-range page numbers to the last page", () => {
    renderPage();

    const input = screen.getByLabelText("Go to page");
    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.click(screen.getByText("Go"));

    expect(mockedUseRawData).toHaveBeenLastCalledWith(
      "index",
      "^WIG20",
      3,
      50
    );
  });
});
