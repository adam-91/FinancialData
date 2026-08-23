import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useIndices } from "../hooks/useIndices";
import { getIndexHistory } from "../api/indices";
import { Period } from "../types/index";
import {
  AnalyticsPageLayout,
  AnalyticsTile,
  AnalyticsTileTitle,
} from "../components/analytics/AnalyticsPageLayout";
import { OHLCChartView } from "../components/analytics/OHLCChartView";
import { IndexTableBody } from "../components/analytics/IndexTableBody";
import { Select } from "../components/ui/Select";
import { MultiSelect } from "../components/ui/MultiSelect";
import { ChartType } from "../components/chart/ChartControls";

export function AnalyticsExchangesPage() {
  const { t } = useTranslation();
  const { data: indices } = useIndices();
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["^WIG20"]);
  const [period, setPeriod] = useState<Period>("1y");

  const singleSymbol = selectedSymbols[0] || "^WIG20";

  const indexOptions = useMemo(() => {
    return (indices ?? []).map((i) => ({
      value: i.symbol,
      label: `${i.name} (${i.stock_exchange})`,
    }));
  }, [indices]);

  const handleSymbolChange = (selected: string[]) => {
    if (chartType === "candlestick") {
      setSelectedSymbols(selected.slice(0, 1));
    } else {
      setSelectedSymbols(selected.slice(0, 4));
    }
  };

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    if (type === "candlestick") {
      setSelectedSymbols((prev) => prev.slice(0, 1));
    }
  };

  const getSeriesLabel = (sym: string) => {
    const idx = indices?.find((i) => i.symbol === sym);
    return idx ? `${idx.name} (${idx.stock_exchange})` : sym;
  };

  const toolbar =
    chartType === "candlestick" ? (
      <Select value={singleSymbol} onChange={(e) => setSelectedSymbols([e.target.value])}>
        {indexOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    ) : (
      <MultiSelect
        options={indexOptions}
        selected={selectedSymbols}
        onChange={handleSymbolChange}
        placeholder={t("chart.selectIndex")}
        maxSelected={4}
      />
    );

  return (
    <AnalyticsPageLayout
      toolbar={toolbar}
      chart={
        <AnalyticsTile>
          <OHLCChartView
            selectedSymbols={selectedSymbols}
            chartType={chartType}
            period={period}
            onChartTypeChange={handleChartTypeChange}
            onPeriodChange={setPeriod}
            getHistory={getIndexHistory}
            getSeriesLabel={getSeriesLabel}
            namespace="indexHistory"
          />
        </AnalyticsTile>
      }
      table={
        <AnalyticsTile>
          <AnalyticsTileTitle>{t("analytics.quotations")}</AnalyticsTileTitle>
          <IndexTableBody />
        </AnalyticsTile>
      }
    />
  );
}
