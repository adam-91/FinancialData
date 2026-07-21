import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, CandlestickSeries, LineSeries, ISeriesApi, SeriesType } from "lightweight-charts";
import styled from "styled-components";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { IndexOHLCV } from "../../types/index";
import { ChartType } from "./ChartControls";

const ChartContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

interface StockChartProps {
  data: IndexOHLCV[];
  chartType: ChartType;
}

export function StockChart({ data, chartType }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const { theme } = useTheme();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: theme.colors.surface },
        textColor: theme.colors.text.secondary,
      },
      grid: {
        vertLines: { color: theme.colors.border },
        horzLines: { color: theme.colors.border },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: theme.colors.accent,
          width: 1,
          style: 2,
        },
        horzLine: {
          color: theme.colors.accent,
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: theme.colors.border,
      },
      timeScale: {
        borderColor: theme.colors.border,
        timeVisible: false,
      },
      localization: {
        locale: i18n.language,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    chartRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === chartContainerRef.current) {
          chart.applyOptions({
            width: entry.contentRect.width,
          });
        }
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: theme.colors.surface },
        textColor: theme.colors.text.secondary,
      },
      grid: {
        vertLines: { color: theme.colors.border },
        horzLines: { color: theme.colors.border },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: theme.colors.accent,
          width: 1,
          style: 2,
        },
        horzLine: {
          color: theme.colors.accent,
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: theme.colors.border,
      },
      timeScale: {
        borderColor: theme.colors.border,
      },
      localization: {
        locale: i18n.language,
      },
    });
  }, [theme, i18n.language]);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    if (seriesRef.current && chartRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    if (chartType === "candlestick") {
      const series = chartRef.current.addSeries(CandlestickSeries, {
        upColor: theme.colors.success,
        downColor: theme.colors.danger,
        borderUpColor: theme.colors.success,
        borderDownColor: theme.colors.danger,
        wickUpColor: theme.colors.success,
        wickDownColor: theme.colors.danger,
      });

      const candleData = data.map((d) => ({
        time: d.time as `${number}-${number}-${number}`,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      series.setData(candleData);
      seriesRef.current = series;
      chartRef.current.timeScale().fitContent();
    } else {
      const series = chartRef.current.addSeries(LineSeries, {
        color: theme.colors.accent,
        lineWidth: 2,
      });

      const lineData = data.map((d) => ({
        time: d.time as `${number}-${number}-${number}`,
        value: d.close,
      }));

      series.setData(lineData);
      seriesRef.current = series;
      chartRef.current.timeScale().fitContent();
    }
  }, [data, chartType, theme]);

  return <ChartContainer ref={chartContainerRef} />;
}
