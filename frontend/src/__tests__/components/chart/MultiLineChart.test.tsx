import { describe, it, expect, vi } from "vitest";
import { render } from "../../../test-utils";
import { MultiLineChart } from "../../../components/chart/MultiLineChart";

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
  LineSeries: "LineSeries",
}));

const stringSeries = [
  {
    label: "EUR",
    data: [
      { time: "2024-01-02", value: "4.3257" },
      { time: "2024-01-03", value: "4.3312" },
    ] as unknown as { time: string; value: number }[],
  },
];

describe("MultiLineChart", () => {
  it("should coerce string values to numbers", () => {
    setDataCalls.length = 0;

    render(<MultiLineChart series={stringSeries} />);

    const data = setDataCalls[0]?.mock.calls[0][0];
    expect(data).toBeDefined();
    expect(typeof data[0].value).toBe("number");
    expect(data[0].value).toBe(4.3257);
  });
});
