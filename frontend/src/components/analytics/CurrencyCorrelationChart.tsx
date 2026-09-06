import styled from "styled-components";
import { useCorrelation } from "../../hooks/useCurrencyAnalytics";
import { useTheme } from "../../contexts/ThemeContext";

const Matrix = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const HeaderCell = styled.th`
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const RowLabel = styled.th`
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Cell = styled.td`
  padding: 6px 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  font-family: monospace;
  border-radius: 4px;
`;

const Hint = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
`;

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CurrencyCorrelationChart({ codes }: { codes: string[] }) {
  const { data, isLoading } = useCorrelation(codes);
  const { theme } = useTheme();

  if (isLoading) {
    return <Hint>...</Hint>;
  }

  if (!data || data.codes.length === 0 || data.values.length === 0) {
    return <Hint>–</Hint>;
  }

  return (
    <Matrix>
      <thead>
        <tr>
          <HeaderCell />
          {data.codes.map((c) => (
            <HeaderCell key={c}>{c}</HeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.codes.map((c, i) => (
          <tr key={c}>
            <RowLabel>{c}</RowLabel>
            {data.values[i].map((v, j) => {
              const alpha = Math.abs(v);
              const background =
                v >= 0
                  ? hexToRgba(theme.colors.success, alpha)
                  : hexToRgba(theme.colors.danger, alpha);
              const color =
                alpha > 0.6 ? "#ffffff" : theme.colors.text.primary;
              return (
                <Cell key={j} style={{ background, color }}>
                  {v.toFixed(2)}
                </Cell>
              );
            })}
          </tr>
        ))}
      </tbody>
    </Matrix>
  );
}
