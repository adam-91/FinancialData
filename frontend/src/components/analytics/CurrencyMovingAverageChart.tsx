import { useMemo, useState } from "react";
import styled from "styled-components";
import { useMovingAverage } from "../../hooks/useCurrencyAnalytics";
import { MultiLineChart } from "../chart/MultiLineChart";
import { TrendInfo } from "../../types/currencyAnalytics";

const WINDOWS = [7, 30, 90];

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const ToggleGroup = styled.div`
  display: flex;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 5px 10px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accent : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? "#fff" : theme.colors.text.secondary};

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.accentHover : theme.colors.surfaceHover};
  }

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const TrendList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const TrendBadge = styled.span<{ $direction: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 12px;
  font-weight: 600;
  background: ${({ $direction, theme }) =>
    $direction === "up"
      ? theme.colors.successBg
      : $direction === "down"
        ? theme.colors.dangerBg
        : theme.colors.surfaceHover};
  color: ${({ $direction, theme }) =>
    $direction === "up"
      ? theme.colors.success
      : $direction === "down"
        ? theme.colors.danger
        : theme.colors.text.muted};
`;

const Hint = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
`;

function arrow(direction: string): string {
  if (direction === "up") return "▲";
  if (direction === "down") return "▼";
  return "—";
}

function TrendBadgeView({ code, trend }: { code: string; trend: TrendInfo }) {
  return (
    <TrendBadge $direction={trend.direction}>
      {code} {arrow(trend.direction)} {trend.percent.toFixed(2)}%
    </TrendBadge>
  );
}

export function CurrencyMovingAverageChart({ codes }: { codes: string[] }) {
  const [window, setWindow] = useState(30);
  const { data, isLoading } = useMovingAverage(codes, window);

  const series = useMemo(() => {
    return (data ?? []).map((s) => ({
      label: s.code,
      data: s.data
        .filter((p) => p.ma != null)
        .map((p) => ({ time: p.date, value: p.ma as number })),
    }));
  }, [data]);

  if (isLoading) {
    return <Hint>...</Hint>;
  }

  if (!data || data.length === 0) {
    return <Hint>–</Hint>;
  }

  return (
    <>
      <Controls>
        <ToggleGroup>
          {WINDOWS.map((w) => (
            <ToggleButton
              key={w}
              $active={window === w}
              onClick={() => setWindow(w)}
            >
              {w}
            </ToggleButton>
          ))}
        </ToggleGroup>
      </Controls>
      <MultiLineChart series={series} height={220} />
      <TrendList>
        {data.map((s) => (
          <TrendBadgeView key={s.code} code={s.code} trend={s.trend} />
        ))}
      </TrendList>
    </>
  );
}
