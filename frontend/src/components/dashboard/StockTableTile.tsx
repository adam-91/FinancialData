import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useIndices } from "../../hooks/useIndices";
import { useStockPrices } from "../../hooks/useStocks";
import { TileWrapper } from "./TileWrapper";

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
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

const SymbolBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.accent}20;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
  font-size: 12px;
  font-family: monospace;
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

type SortField = "symbol" | "name" | "price" | "change" | "volume";
type SortDirection = "asc" | "desc";

export function StockTableTile() {
  const { t } = useTranslation();
  const { data: indices, isLoading: indicesLoading } = useIndices();
  const { data: stocks, isLoading: stocksLoading } = useStockPrices();
  const [selectedIndex, setSelectedIndex] = useState("^WIG20");
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredStocks = useMemo(() => {
    if (!stocks) return [];
    return stocks.filter((s) => s.indices.includes(selectedIndex));
  }, [stocks, selectedIndex]);

  const sortedStocks = useMemo(() => {
    const sorted = [...filteredStocks];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === "symbol") cmp = a.symbol.localeCompare(b.symbol);
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "price") cmp = a.price.close - b.price.close;
      else if (sortField === "change") cmp = a.price.change_percent - b.price.change_percent;
      else if (sortField === "volume") cmp = a.price.volume - b.price.volume;
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredStocks, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatVolume = (vol: number): string => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
  };

  if (indicesLoading || stocksLoading) {
    return (
      <TileWrapper title={t("dashboard.tiles.stockTable")} titleLink="/analytics/companies">
        <LoadingText>{t("app.loading")}</LoadingText>
      </TileWrapper>
    );
  }

  return (
    <TileWrapper title={t("dashboard.tiles.stockTable")} titleLink="/analytics/companies">
      <Controls>
        <Select value={selectedIndex} onChange={(e) => setSelectedIndex(e.target.value)}>
          {(indices ?? []).map((idx) => (
            <option key={idx.symbol} value={idx.symbol}>
              {idx.name} ({idx.stock_exchange})
            </option>
          ))}
        </Select>
      </Controls>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th $sortable onClick={() => handleSort("symbol")}>
                {t("stocks.symbol")}
                <SortIcon $active={sortField === "symbol"} $direction={sortDirection} />
              </Th>
              <Th $sortable onClick={() => handleSort("name")}>
                {t("stocks.name")}
                <SortIcon $active={sortField === "name"} $direction={sortDirection} />
              </Th>
              <Th $sortable style={{ textAlign: "right" }} onClick={() => handleSort("price")}>
                {t("stocks.price")}
                <SortIcon $active={sortField === "price"} $direction={sortDirection} />
              </Th>
              <Th $sortable style={{ textAlign: "right" }} onClick={() => handleSort("change")}>
                {t("stocks.changePercent")}
                <SortIcon $active={sortField === "change"} $direction={sortDirection} />
              </Th>
              <Th $sortable style={{ textAlign: "right" }} onClick={() => handleSort("volume")}>
                {t("stocks.volume")}
                <SortIcon $active={sortField === "volume"} $direction={sortDirection} />
              </Th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock) => {
              const isPositive = stock.price.change >= 0;
              return (
                <Tr key={stock.symbol}>
                  <Td>
                    <SymbolBadge>{stock.symbol}</SymbolBadge>
                  </Td>
                  <Td style={{ fontWeight: 500 }}>{stock.name}</Td>
                  <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                    {stock.price.close.toFixed(2)}
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    <ChangeBadge $positive={isPositive}>
                      {isPositive ? "+" : ""}
                      {stock.price.change_percent.toFixed(2)}%
                    </ChangeBadge>
                  </Td>
                  <Td style={{ textAlign: "right", fontFamily: "monospace", color: "inherit" }}>
                    {formatVolume(stock.price.volume)}
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
