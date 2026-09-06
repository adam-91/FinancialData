import { useMemo } from "react";
import styled from "styled-components";
import { useQueries } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Period } from "../../types/index";
import { PeriodSelector } from "../ui/PeriodSelector";
import { StockChart } from "../chart/StockChart";
import { MultiLineChart } from "../chart/MultiLineChart";
import { ChartType } from "../chart/ChartControls";

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
  margin-bottom: 12px;
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.surface)};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text.secondary)};

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.accentHover : theme.colors.surfaceHover)};
  }

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

interface HistoryPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HistoryResponse {
  data: HistoryPoint[];
}

interface OHLCChartViewProps {
  selectedSymbols: string[];
  chartType: ChartType;
  period: Period;
  onChartTypeChange: (type: ChartType) => void;
  onPeriodChange: (period: Period) => void;
  getHistory: (symbol: string, period: Period) => Promise<HistoryResponse>;
  getSeriesLabel?: (symbol: string) => string;
  namespace: string;
  height?: number;
}

export function OHLCChartView({
  selectedSymbols,
  chartType,
  period,
  onChartTypeChange,
  onPeriodChange,
  getHistory,
  getSeriesLabel,
  namespace,
  height = 280,
}: OHLCChartViewProps) {
  const { t } = useTranslation();
  const singleSymbol = selectedSymbols[0] || "";

  const singleResults = useQueries({
    queries:
      chartType === "candlestick" && singleSymbol
        ? [
            {
              queryKey: [namespace, singleSymbol, period],
              queryFn: () => getHistory(singleSymbol, period),
            },
          ]
        : [],
  });

  const lineResults = useQueries({
    queries:
      chartType === "line"
        ? selectedSymbols.map((sym) => ({
            queryKey: [namespace, sym, period],
            queryFn: () => getHistory(sym, period),
          }))
        : [],
  });

  const multiSeries = useMemo(() => {
    if (chartType !== "line") return [];
    return selectedSymbols.map((sym, i) => {
      const data = lineResults[i]?.data?.data ?? [];
      return {
        label: getSeriesLabel ? getSeriesLabel(sym) : sym,
        data: data.map((d) => ({ time: d.time, value: d.close })),
      };
    });
  }, [chartType, selectedSymbols, lineResults, getSeriesLabel]);

  return (
    <>
      <Controls>
        <ToggleGroup>
          <ToggleButton
            $active={chartType === "candlestick"}
            onClick={() => onChartTypeChange("candlestick")}
          >
            {t("chart.candlestick")}
          </ToggleButton>
          <ToggleButton
            $active={chartType === "line"}
            onClick={() => onChartTypeChange("line")}
          >
            {t("chart.line")}
          </ToggleButton>
        </ToggleGroup>
        <PeriodSelector selectedPeriod={period} onPeriodChange={onPeriodChange} />
      </Controls>
      {chartType === "candlestick" ? (
        <StockChart data={singleResults[0]?.data?.data ?? []} chartType="candlestick" height={height} />
      ) : (
        <MultiLineChart series={multiSeries} height={height} />
      )}
    </>
  );
}
