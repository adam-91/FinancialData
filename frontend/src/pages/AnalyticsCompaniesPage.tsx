import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useIndices } from "../hooks/useIndices";
import { useStockPrices } from "../hooks/useStocks";
import { getStockHistory } from "../api/stocks";
import { Period } from "../types/index";
import {
  AnalyticsPageLayout,
  AnalyticsTile,
  AnalyticsTileTitle,
} from "../components/analytics/AnalyticsPageLayout";
import { OHLCChartView } from "../components/analytics/OHLCChartView";
import { StockTableBody } from "../components/analytics/StockTableBody";
import { Select } from "../components/ui/Select";
import { MultiSelect } from "../components/ui/MultiSelect";
import { ChartType } from "../components/chart/ChartControls";

export function AnalyticsCompaniesPage() {
  const { t } = useTranslation();
  const { data: indices } = useIndices();
  const { data: stocks } = useStockPrices();
  const [selectedIndex, setSelectedIndex] = useState("^WIG20");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [period, setPeriod] = useState<Period>("1y");

  const indexOptions = useMemo(() => {
    return indices ?? [];
  }, [indices]);

  const stocksForIndex = useMemo(() => {
    if (!stocks) return [];
    return stocks.filter((s) => s.indices.includes(selectedIndex));
  }, [stocks, selectedIndex]);

  const stockOptions = useMemo(() => {
    return stocksForIndex.map((s) => ({
      value: s.symbol,
      label: `${s.symbol} - ${s.name}`,
    }));
  }, [stocksForIndex]);

  useEffect(() => {
    if (stocksForIndex.length > 0 && selectedStocks.length === 0) {
      setSelectedStocks([stocksForIndex[0].symbol]);
    }
  }, [stocksForIndex, selectedStocks.length]);

  const handleStockChange = (selected: string[]) => {
    if (chartType === "candlestick") {
      setSelectedStocks(selected.slice(0, 1));
    } else {
      setSelectedStocks(selected.slice(0, 4));
    }
  };

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    if (type === "candlestick") {
      setSelectedStocks((prev) => prev.slice(0, 1));
    }
  };

  const handleIndexChange = (index: string) => {
    setSelectedIndex(index);
    setSelectedStocks([]);
  };

  const toolbar = (
    <>
      <Select value={selectedIndex} onChange={(e) => handleIndexChange(e.target.value)}>
        {indexOptions.map((idx) => (
          <option key={idx.symbol} value={idx.symbol}>
            {idx.name} ({idx.stock_exchange})
          </option>
        ))}
      </Select>
      {chartType === "candlestick" ? (
        <Select
          value={selectedStocks[0] || ""}
          onChange={(e) => setSelectedStocks([e.target.value])}
        >
          {stockOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      ) : (
        <MultiSelect
          options={stockOptions}
          selected={selectedStocks}
          onChange={handleStockChange}
          placeholder={t("stocks.selectCompanies")}
          maxSelected={4}
        />
      )}
    </>
  );

  return (
    <AnalyticsPageLayout
      toolbar={toolbar}
      chart={
        <AnalyticsTile>
          <OHLCChartView
            selectedSymbols={selectedStocks}
            chartType={chartType}
            period={period}
            onChartTypeChange={handleChartTypeChange}
            onPeriodChange={setPeriod}
            getHistory={getStockHistory}
            namespace="stockHistory"
            height={260}
          />
        </AnalyticsTile>
      }
      table={
        <AnalyticsTile>
          <AnalyticsTileTitle>{t("analytics.quotations")}</AnalyticsTileTitle>
          <StockTableBody selectedIndex={selectedIndex} />
        </AnalyticsTile>
      }
    />
  );
}
