import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, LineSeries, ISeriesApi, SeriesType } from "lightweight-charts";
import styled from "styled-components";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const ChartContainer = styled.div<{ $height?: number }>`
  width: 100%;
  height: ${({ $height }) => $height || 400}px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

const LINE_COLORS = [
  "#4f46e5", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
];

interface LineData {
  time: string;
  value: number;
}

interface SeriesData {
  label: string;
  data: LineData[];
}

interface MultiLineChartProps {
  series: SeriesData[];
  height?: number;
}

export function MultiLineChart({ series, height = 400 }: MultiLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<SeriesType>[]>([]);
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
        vertLine: { color: theme.colors.accent, width: 1, style: 2 },
        horzLine: { color: theme.colors.accent, width: 1, style: 2 },
      },
      rightPriceScale: { borderColor: theme.colors.border },
      timeScale: { borderColor: theme.colors.border, timeVisible: false },
      localization: { locale: i18n.language },
      width: chartContainerRef.current.clientWidth,
      height,
    });

    chartRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === chartContainerRef.current) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRefs.current = [];
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
        vertLine: { color: theme.colors.accent, width: 1, style: 2 },
        horzLine: { color: theme.colors.accent, width: 1, style: 2 },
      },
      rightPriceScale: { borderColor: theme.colors.border },
      timeScale: { borderColor: theme.colors.border },
      localization: { locale: i18n.language },
    });
  }, [theme, i18n.language]);

  useEffect(() => {
    if (!chartRef.current) return;

    seriesRefs.current.forEach((s) => {
      if (chartRef.current) chartRef.current.removeSeries(s);
    });
    seriesRefs.current = [];

    series.forEach((s, i) => {
      if (!chartRef.current) return;
      const lineSeries = chartRef.current.addSeries(LineSeries, {
        color: LINE_COLORS[i % LINE_COLORS.length],
        lineWidth: 2,
        title: s.label,
      });
      lineSeries.setData(
        s.data.map((d) => ({
          time: d.time as `${number}-${number}-${number}`,
          value: Number(d.value),
        }))
      );
      seriesRefs.current.push(lineSeries);
    });

    chartRef.current.timeScale().fitContent();
  }, [series]);

  return <ChartContainer ref={chartContainerRef} $height={height} />;
}
