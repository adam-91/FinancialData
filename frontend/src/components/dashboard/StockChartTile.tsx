import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useIndices } from "../../hooks/useIndices";
import { useStockPrices } from "../../hooks/useStocks";
import { getStockHistory } from "../../api/stocks";
import { Period } from "../../types/index";
import { TileWrapper } from "./TileWrapper";
import { MultiSelect } from "../ui/MultiSelect";
import { Select } from "../ui/Select";
import { OHLCChartView } from "../analytics/OHLCChartView";
import { ChartType } from "../chart/ChartControls";

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  text-align: center;
  padding: 40px;
`;

export function StockChartTile() {
  const { t } = useTranslation();
  const { data: indices, isLoading: indicesLoading } = useIndices();
  const { data: stocks, isLoading: stocksLoading } = useStockPrices();
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

  if (indicesLoading || stocksLoading) {
    return (
      <TileWrapper title={t("dashboard.tiles.stockChart")} titleLink="/analytics/companies">
        <LoadingText>{t("app.loading")}</LoadingText>
      </TileWrapper>
    );
  }

  return (
    <TileWrapper title={t("dashboard.tiles.stockChart")} titleLink="/analytics/companies">
      <Controls>
        <Select value={selectedIndex} onChange={(e) => {
          setSelectedIndex(e.target.value);
          setSelectedStocks([]);
        }}>
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
      </Controls>
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
    </TileWrapper>
  );
}
