import { useMemo } from "react";
import styled from "styled-components";
import { useCurrencySummary } from "../../hooks/useRates";
import { CurrencySummary } from "../../types/currencyExchangeRate";

const SYMBOL_MAP: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

const FIXED_CODES = ["USD", "EUR", "GBP", "JPY"];

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 12px;
`;

const Tile = styled.div<{ $tone?: "gain" | "loss" }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === "gain"
        ? theme.colors.success
        : $tone === "loss"
          ? theme.colors.danger
          : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, $tone }) =>
    $tone === "gain"
      ? theme.colors.successBg
      : $tone === "loss"
        ? theme.colors.dangerBg
        : theme.colors.surface};
`;

const Symbol = styled.span`
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  min-width: 0;
`;

const Change = styled.span<{ $positive: boolean }>`
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.success : theme.colors.danger};
`;

const Rate = styled.span`
  font-size: 13px;
  font-weight: 600;
  font-family: monospace;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  text-align: center;
  padding: 40px;
`;

function getSymbol(code: string): string {
  return SYMBOL_MAP[code] ?? code;
}

function formatRate(item: CurrencySummary | null): string {
  if (!item) return "-";
  const rate =
    item.mid != null
      ? Number(item.mid)
      : item.bid != null && item.ask != null
        ? (Number(item.bid) + Number(item.ask)) / 2
        : null;
  return rate != null ? rate.toFixed(4) : "-";
}

function formatChange(item: CurrencySummary | null): string {
  if (!item || item.change == null) return "-";
  return `${item.change >= 0 ? "+" : ""}${item.change.toFixed(2)}%`;
}

export function CurrencySummaryTiles() {
  const { data, isLoading } = useCurrencySummary();

  const byCode = useMemo(() => {
    const map: Record<string, CurrencySummary> = {};
    (data ?? []).forEach((c) => {
      map[c.code] = c;
    });
    return map;
  }, [data]);

  const tradable = useMemo(() => {
    return (data ?? []).filter(
      (c) =>
        !FIXED_CODES.includes(c.code) &&
        c.bid != null &&
        c.ask != null &&
        c.change != null,
    );
  }, [data]);

  const gainer = useMemo(() => {
    return tradable.reduce<CurrencySummary | null>(
      (acc, c) => (acc == null || c.change! > acc.change! ? c : acc),
      null,
    );
  }, [tradable]);

  const loser = useMemo(() => {
    return tradable.reduce<CurrencySummary | null>(
      (acc, c) => (acc == null || c.change! < acc.change! ? c : acc),
      null,
    );
  }, [tradable]);

  if (isLoading) {
    return <LoadingText>...</LoadingText>;
  }

  const tiles: Array<{
    id: string;
    item: CurrencySummary | null;
    symbol: string;
    tone?: "gain" | "loss";
  }> = [
    {
      id: "gainer",
      item: gainer,
      symbol: gainer ? getSymbol(gainer.code) : "–",
      tone: "gain",
    },
    {
      id: "loser",
      item: loser,
      symbol: loser ? getSymbol(loser.code) : "–",
      tone: "loss",
    },
    { id: "USD", item: byCode["USD"] ?? null, symbol: "$" },
    { id: "EUR", item: byCode["EUR"] ?? null, symbol: "€" },
    { id: "GBP", item: byCode["GBP"] ?? null, symbol: "£" },
    { id: "JPY", item: byCode["JPY"] ?? null, symbol: "¥" },
  ];

  return (
    <Grid>
      {tiles.map(({ id, item, symbol, tone }) => {
        const positive = item != null && item.change != null && item.change >= 0;
        return (
          <Tile key={id} $tone={tone}>
            <Symbol>{symbol}</Symbol>
            <Right>
              <Change $positive={positive}>{formatChange(item)}</Change>
              <Rate>{formatRate(item)}</Rate>
            </Right>
          </Tile>
        );
      })}
    </Grid>
  );
}
