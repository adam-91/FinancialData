import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { useIndices, useIndexHistory } from "../../hooks/useIndices";
import { getIndexHistory } from "../../api/indices";
import { Period } from "../../types/index";
import { useSettings } from "../../contexts/SettingsContext";
import { useSessionDefault } from "../../hooks/useSessionDefault";
import { TileWrapper } from "./TileWrapper";
import { PeriodSelector } from "../ui/PeriodSelector";
import { MultiSelect } from "../ui/MultiSelect";
import { StockChart } from "../chart/StockChart";
import { MultiLineChart } from "../chart/MultiLineChart";
import { ChartType } from "../chart/ChartControls";

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ToggleGroup = styled.div`
  display: flex;
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

const Select = styled.select`
  padding: 8px 32px 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  min-width: 200px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
  }
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
  const { defaultExchange, version } = useSettings();
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [selectedSymbols, setSelectedSymbols] = useSessionDefault<string[]>(
    () => {
      if (defaultExchange && indices) {
        const exchangeIndices = indices.filter(
          (i) => i.stock_exchange === defaultExchange
        );
        if (exchangeIndices.length > 0) {
          return exchangeIndices.slice(0, 4).map((i) => i.symbol);
        }
      }
      return ["^WIG20"];
    },
    !!indices,
    version
  );
  const [period, setPeriod] = useState<Period>("1y");

  const singleSymbol = selectedSymbols[0] || "^WIG20";
  const { data: historyData } = useIndexHistory(
    chartType === "candlestick" ? singleSymbol : "",
    period
  );

  const lineHistoryResults = useQueries({
    queries: chartType === "line"
      ? selectedSymbols.map((sym) => ({
          queryKey: ["indexHistory", sym, period],
          queryFn: () => getIndexHistory(sym, period),
        }))
      : [],
  });

  const multiSeries = useMemo(() => {
    if (chartType !== "line" || selectedSymbols.length === 0) return [];
    return selectedSymbols.map((sym, i) => {
      const idx = indices?.find((i2) => i2.symbol === sym);
      const data = lineHistoryResults[i]?.data?.data ?? [];
      return {
        label: idx ? `${idx.name} (${idx.stock_exchange})` : sym,
        data: data.map((d) => ({ time: d.time, value: d.close })),
      };
    });
  }, [chartType, selectedSymbols, indices, lineHistoryResults]);

  const indexOptions = useMemo(() => {
    return (indices ?? []).map((i) => ({
      value: i.symbol,
      label: `${i.name} (${i.stock_exchange})`,
    }));
  }, [indices]);

  const maxSymbols = chartType === "candlestick" ? 1 : 4;

  const handleSymbolChange = (selected: string[]) => {
    if (chartType === "candlestick") {
      setSelectedSymbols(selected.slice(0, 1));
    } else {
      setSelectedSymbols(selected.slice(0, 4));
    }
  };

  if (isLoading) {
    return (
      <TileWrapper title={t("dashboard.tiles.indexChart")}>
        <LoadingText>{t("app.loading")}</LoadingText>
      </TileWrapper>
    );
  }

  return (
    <TileWrapper title={t("dashboard.tiles.indexChart")}>
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
        <ToggleGroup>
          <ToggleButton
            $active={chartType === "candlestick"}
            onClick={() => {
              setChartType("candlestick");
              setSelectedSymbols((prev) => prev.slice(0, 1));
            }}
          >
            {t("chart.candlestick")}
          </ToggleButton>
          <ToggleButton
            $active={chartType === "line"}
            onClick={() => setChartType("line")}
          >
            {t("chart.line")}
          </ToggleButton>
        </ToggleGroup>
        <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
      </Controls>
      {chartType === "candlestick" ? (
        <StockChart data={historyData?.data ?? []} chartType="candlestick" height={280} />
      ) : (
        <MultiLineChart series={multiSeries} height={280} />
      )}
    </TileWrapper>
  );
}
