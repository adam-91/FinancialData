import { useMemo } from "react";
import styled from "styled-components";
import { useQueries } from "@tanstack/react-query";
import { Period } from "../../types/index";
import { PeriodSelector } from "../ui/PeriodSelector";
import { MultiLineChart } from "../chart/MultiLineChart";
import { getCurrencyHistory } from "../../api/currencyHistory";

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
  margin-bottom: 12px;
`;

interface CurrencyChartViewProps {
  selectedCurrencies: string[];
  period: Period;
  onPeriodChange: (period: Period) => void;
  height?: number;
}

export function CurrencyChartView({
  selectedCurrencies,
  period,
  onPeriodChange,
  height = 280,
}: CurrencyChartViewProps) {
  const historyResults = useQueries({
    queries: selectedCurrencies.map((code) => ({
      queryKey: ["currencyHistory", code, period],
      queryFn: () => getCurrencyHistory(code, period),
      enabled: !!code,
    })),
  });

  const series = useMemo(() => {
    return selectedCurrencies.map((code, i) => {
      const data = historyResults[i]?.data?.data ?? [];
      return {
        label: code,
        data: data.map((d) => ({ time: d.time, value: d.mid })),
      };
    });
  }, [selectedCurrencies, historyResults]);

  return (
    <>
      <Controls>
        <PeriodSelector selectedPeriod={period} onPeriodChange={onPeriodChange} />
      </Controls>
      <MultiLineChart series={series} height={height} />
    </>
  );
}
