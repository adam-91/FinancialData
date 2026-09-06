import { useMemo } from "react";
import styled from "styled-components";
import { useDailyChange } from "../../hooks/useCurrencyAnalytics";
import { DailyChangePoint } from "../../types/currencyAnalytics";

const HALF = 42;

const Series = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SeriesLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LastChange = styled.span<{ $positive: boolean }>`
  font-weight: 700;
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.success : theme.colors.danger};
`;

const ChartBox = styled.div`
  position: relative;
  width: 100%;
  height: ${HALF * 2}px;
  margin-top: 8px;
`;

const ZeroLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Bar = styled.div<{
  $up: boolean;
  $height: number;
  $left: number;
  $width: number;
}>`
  position: absolute;
  left: ${({ $left }) => $left}%;
  width: ${({ $width }) => $width}%;
  top: ${({ $up, $height }) => ($up ? `calc(50% - ${$height}px)` : "50%")};
  height: ${({ $height }) => $height}px;
  background: ${({ $up, theme }) =>
    $up ? theme.colors.success : theme.colors.danger};
  opacity: 0.85;
`;

const Hint = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
`;

function BarChart({ data }: { data: DailyChangePoint[] }) {
  const max = useMemo(
    () => Math.max(...data.map((d) => Math.abs(d.change)), 1e-6),
    [data],
  );
  const n = data.length;

  return (
    <ChartBox>
      <ZeroLine />
      {data.map((d, i) => {
        const height = Math.max((Math.abs(d.change) / max) * (HALF - 3), 2);
        return (
          <Bar
            key={`${d.date}-${i}`}
            $up={d.change >= 0}
            $height={height}
            $left={(i / n) * 100}
            $width={100 / n}
            title={`${d.date}: ${d.change.toFixed(2)}%`}
          />
        );
      })}
    </ChartBox>
  );
}

export function CurrencyDailyChangeChart({ codes }: { codes: string[] }) {
  const { data, isLoading } = useDailyChange(codes);

  if (isLoading) {
    return <Hint>...</Hint>;
  }

  if (!data || data.length === 0) {
    return <Hint>–</Hint>;
  }

  return (
    <div>
      {data.map((series) => {
        const last = series.data[series.data.length - 1];
        return (
          <Series key={series.code}>
            <SeriesLabel>
              <span>{series.code}</span>
              {last && (
                <LastChange $positive={last.change >= 0}>
                  {last.change >= 0 ? "+" : ""}
                  {last.change.toFixed(2)}%
                </LastChange>
              )}
            </SeriesLabel>
            <BarChart data={series.data} />
          </Series>
        );
      })}
    </div>
  );
}
