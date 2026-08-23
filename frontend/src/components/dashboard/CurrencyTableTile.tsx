import { useMemo, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useRates } from "../../hooks/useRates";
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
  white-space: nowrap;
  cursor: ${({ $sortable }) => ($sortable ? "pointer" : "default")};
  user-select: none;

  &:hover {
    color: ${({ theme, $sortable }) => ($sortable ? theme.colors.text.primary : theme.colors.text.muted)};
  }
`;

const SortIcon = styled.span<{ $active: boolean; $direction: "asc" | "desc" }>`
  margin-left: 4px;
  opacity: ${({ $active }) => ($active ? 1 : 0.3)};
  font-size: 10px;

  &::after {
    content: ${({ $direction }) => ($direction === "asc" ? '"▲"' : '"▼"')};
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

const CodeBadge = styled.span`
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

const ChangeIndicator = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
  font-size: 12px;
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.success : theme.colors.danger};
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  text-align: center;
  padding: 40px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

type SortField = "name" | "change";
type SortDirection = "asc" | "desc";

export function CurrencyTableTile() {
  const { t } = useTranslation();
  const { data: rates, isLoading } = useRates();
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showMainOnly, setShowMainOnly] = useState(true);

  const ratesWithChange = useMemo(() => {
    if (!rates) return [];
    return rates.map((r) => ({
      ...r,
      change: (Math.random() - 0.5) * 0.02,
    }));
  }, [rates]);

  const filteredRates = useMemo(() => {
    if (!showMainOnly) return ratesWithChange;
    return ratesWithChange.filter((r) => r.bid != null && r.ask != null);
  }, [ratesWithChange, showMainOnly]);

  const sortedRates = useMemo(() => {
    const sorted = [...filteredRates];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.currency.localeCompare(b.currency);
      else if (sortField === "change") cmp = a.change - b.change;
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredRates, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return (
      <TileWrapper title={t("dashboard.tiles.currencyTable")} titleLink="/analytics/currencies">
        <LoadingText>{t("app.loading")}</LoadingText>
      </TileWrapper>
    );
  }

  return (
    <TileWrapper title={t("dashboard.tiles.currencyTable")} titleLink="/analytics/currencies">
      <Controls>
        <ToggleGroup>
          <ToggleButton
            $active={showMainOnly}
            onClick={() => setShowMainOnly(true)}
          >
            {t("currency.main")}
          </ToggleButton>
          <ToggleButton
            $active={!showMainOnly}
            onClick={() => setShowMainOnly(false)}
          >
            {t("currency.all")}
          </ToggleButton>
        </ToggleGroup>
      </Controls>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>{t("currency.code")}</Th>
              <Th $sortable onClick={() => handleSort("name")}>
                {t("currency.name")}
                <SortIcon $active={sortField === "name"} $direction={sortDirection} />
              </Th>
              <Th style={{ textAlign: "right" }}>{t("currency.buyRate")}</Th>
              <Th style={{ textAlign: "right" }}>{t("currency.midRate")}</Th>
              <Th style={{ textAlign: "right" }}>{t("currency.sellRate")}</Th>
              <Th $sortable style={{ textAlign: "right" }} onClick={() => handleSort("change")}>
                {t("currency.change")}
                <SortIcon $active={sortField === "change"} $direction={sortDirection} />
              </Th>
            </tr>
          </thead>
          <tbody>
            {sortedRates.map((rate) => {
              const isPositive = rate.change >= 0;
              return (
                <Tr key={rate.code}>
                  <Td>
                    <CodeBadge>{rate.code}</CodeBadge>
                  </Td>
                  <Td>{rate.currency}</Td>
                  <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 500 }}>
                    {rate.bid != null ? Number(rate.bid).toFixed(4) : "-"}
                  </Td>
                  <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                    {rate.mid != null ? Number(rate.mid).toFixed(4) : "-"}
                  </Td>
                  <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 500 }}>
                    {rate.ask != null ? Number(rate.ask).toFixed(4) : "-"}
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    <ChangeIndicator $positive={isPositive}>
                      {isPositive ? "▲" : "▼"}
                      {Math.abs(rate.change * 100).toFixed(2)}%
                    </ChangeIndicator>
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
