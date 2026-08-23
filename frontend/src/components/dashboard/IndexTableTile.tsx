import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useIndices } from "../../hooks/useIndices";
import { useStockPrices } from "../../hooks/useStocks";
import { TileWrapper } from "./TileWrapper";

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th<{ $sortable?: boolean }>`
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.text.muted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: ${({ $sortable }) => ($sortable ? "pointer" : "default")};
  user-select: none;
  white-space: nowrap;

  &:hover {
    color: ${({ theme, $sortable }) => ($sortable ? theme.colors.text.primary : theme.colors.text.muted)};
  }
`;

const Td = styled.td`
  padding: 10px 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tr = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const ChangeBadge = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: 600;
  font-size: 12px;
  font-family: monospace;
  background: ${({ $positive, theme }) =>
    $positive ? theme.colors.successBg : theme.colors.dangerBg};
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.success : theme.colors.danger};
`;

const SortIcon = styled.span<{ $active: boolean; $direction: "asc" | "desc" }>`
  margin-left: 4px;
  opacity: ${({ $active }) => ($active ? 1 : 0.3)};
  font-size: 10px;

  &::after {
    content: ${({ $direction }) => ($direction === "asc" ? '"▲"' : '"▼"')};
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  text-align: center;
  padding: 40px;
`;

type SortField = "name" | "change" | "exchange";
type SortDirection = "asc" | "desc";

interface IndexRow {
  symbol: string;
  name: string;
  stock_exchange: string;
  close: number;
  change: number;
  change_percent: number;
}

export function IndexTableTile() {
  const { t } = useTranslation();
  const { data: indices, isLoading: indicesLoading } = useIndices();
  const { data: stocks, isLoading: stocksLoading } = useStockPrices();
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const indexData = useMemo((): IndexRow[] => {
    if (!indices || !stocks) return [];
    return indices.map((idx) => {
      const indexStocks = stocks.filter((s) => s.indices.includes(idx.symbol));
      const avgChange = indexStocks.length > 0
        ? indexStocks.reduce((sum, s) => sum + s.price.change_percent, 0) / indexStocks.length
        : 0;
      const avgClose = indexStocks.length > 0
        ? indexStocks.reduce((sum, s) => sum + s.price.close, 0) / indexStocks.length
        : 0;
      return {
        symbol: idx.symbol,
        name: idx.name,
        stock_exchange: idx.stock_exchange,
        close: avgClose,
        change: avgChange * avgClose / 100,
        change_percent: avgChange,
      };
    });
  }, [indices, stocks]);

  const sortedData = useMemo(() => {
    const sorted = [...indexData];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "change") cmp = a.change_percent - b.change_percent;
      else if (sortField === "exchange") cmp = a.stock_exchange.localeCompare(b.stock_exchange);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [indexData, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (indicesLoading || stocksLoading) {
    return (
      <TileWrapper title={t("dashboard.tiles.indexTable")} titleLink="/analytics/exchanges">
        <LoadingText>{t("app.loading")}</LoadingText>
      </TileWrapper>
    );
  }

  return (
    <TileWrapper title={t("dashboard.tiles.indexTable")} titleLink="/analytics/exchanges">
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th $sortable onClick={() => handleSort("name")}>
                {t("stocks.name")}
                <SortIcon $active={sortField === "name"} $direction={sortDirection} />
              </Th>
              <Th $sortable onClick={() => handleSort("exchange")}>
                {t("stocks.exchange")}
                <SortIcon $active={sortField === "exchange"} $direction={sortDirection} />
              </Th>
              <Th style={{ textAlign: "right" }}>{t("stocks.price")}</Th>
              <Th $sortable style={{ textAlign: "right" }} onClick={() => handleSort("change")}>
                {t("stocks.changePercent")}
                <SortIcon $active={sortField === "change"} $direction={sortDirection} />
              </Th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const isPositive = row.change_percent >= 0;
              return (
                <Tr key={row.symbol}>
                  <Td style={{ fontWeight: 500 }}>{row.name}</Td>
                  <Td>{row.stock_exchange}</Td>
                  <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                    {row.close.toFixed(2)}
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    <ChangeBadge $positive={isPositive}>
                      {isPositive ? "+" : ""}
                      {row.change_percent.toFixed(2)}%
                    </ChangeBadge>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    </TileWrapper>
  );
}
