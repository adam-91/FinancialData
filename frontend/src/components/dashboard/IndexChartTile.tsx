import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useIndices } from "../../hooks/useIndices";
import { getIndexHistory } from "../../api/indices";
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

export function IndexChartTile() {
  const { t } = useTranslation();
  const { data: indices, isLoading } = useIndices();
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

  if (isLoading) {
    return (
      <TileWrapper title={t("dashboard.tiles.indexChart")} titleLink="/analytics/exchanges">
        <LoadingText>{t("app.loading")}</LoadingText>
      </TileWrapper>
    );
  }

  return (
    <TileWrapper title={t("dashboard.tiles.indexChart")} titleLink="/analytics/exchanges">
      <Controls>
        {chartType === "candlestick" ? (
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
        )}
      </Controls>
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
    </TileWrapper>
  );
}
