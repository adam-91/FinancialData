import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { useIndices } from "../../hooks/useIndices";
import { useStockPrices } from "../../hooks/useStocks";
import { getStockHistory } from "../../api/stocks";
import { Period } from "../../types/index";
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
  padding: 6px 28px 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  text-align: center;
  padding: 40px;
`;

const HintText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 11px;
  margin: 4px 0 0;
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

  const singleSymbol = selectedStocks[0] || "";
  const singleHistoryResults = useQueries({
    queries: chartType === "candlestick" && singleSymbol
      ? [{
          queryKey: ["stockHistory", singleSymbol, period],
          queryFn: () => getStockHistory(singleSymbol, period),
        }]
      : [],
  });
  const singleHistory = singleHistoryResults[0]?.data;

  const historyResults = useQueries({
    queries: chartType === "line"
      ? selectedStocks.map((sym) => ({
          queryKey: ["stockHistory", sym, period],
          queryFn: () => getStockHistory(sym, period),
        }))
      : [],
  });

  const multiSeries = useMemo(() => {
    if (chartType !== "line") return [];
    return selectedStocks.map((sym, i) => {
      const data = historyResults[i]?.data?.data ?? [];
      return {
        label: sym,
        data: data.map((d) => ({ time: d.time, value: d.close })),
      };
    });
  }, [chartType, selectedStocks, historyResults]);

  const maxStocks = chartType === "candlestick" ? 1 : 4;

  const handleStockChange = (selected: string[]) => {
    if (chartType === "candlestick") {
      setSelectedStocks(selected.slice(0, 1));
    } else {
      setSelectedStocks(selected.slice(0, 4));
    }
  };

  if (indicesLoading || stocksLoading) {
    return (
      <TileWrapper title={t("dashboard.tiles.stockChart")}>
        <LoadingText>{t("app.loading")}</LoadingText>
      </TileWrapper>
    );
  }

  return (
    <TileWrapper title={t("dashboard.tiles.stockChart")}>
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
        <ToggleGroup>
          <ToggleButton
            $active={chartType === "candlestick"}
            onClick={() => {
              setChartType("candlestick");
              setSelectedStocks((prev) => prev.slice(0, 1));
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
        <StockChart data={singleHistory?.data ?? []} chartType="candlestick" height={260} />
      ) : (
        <MultiLineChart series={multiSeries} height={260} />
      )}
    </TileWrapper>
  );
}
