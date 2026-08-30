import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { StockCompany } from "../../types/stock";

const TableWrapper = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.surfaceHover};
`;

const Th = styled.th`
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.text.muted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
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
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.accent}20;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
  font-size: 13px;
  font-family: monospace;
`;

const ChangeBadge = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: 600;
  font-size: 13px;
  font-family: monospace;
  background: ${({ $positive, theme }) =>
    $positive ? theme.colors.successBg : theme.colors.dangerBg};
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.success : theme.colors.danger};
`;

const VolumeText = styled.span`
  font-family: monospace;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface StockTableProps {
  stocks: StockCompany[];
}

export function StockTable({ stocks }: StockTableProps) {
  const { t } = useTranslation();

  const formatVolume = (vol: number): string => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
  };

  return (
    <TableWrapper>
      <Table>
        <Thead>
          <tr>
            <Th>{t("stocks.symbol")}</Th>
            <Th>{t("stocks.name")}</Th>
            <Th>{t("stocks.exchange")}</Th>
            <Th style={{ textAlign: "right" }}>{t("stocks.price")}</Th>
            <Th style={{ textAlign: "right" }}>{t("stocks.change")}</Th>
            <Th style={{ textAlign: "right" }}>{t("stocks.changePercent")}</Th>
            <Th style={{ textAlign: "right" }}>{t("stocks.volume")}</Th>
          </tr>
        </Thead>
        <tbody>
          {stocks.map((stock) => {
            const isPositive = Number(stock.price.change) >= 0;
            return (
              <Tr key={stock.symbol}>
                <Td>
                  <SymbolBadge>{stock.symbol}</SymbolBadge>
                </Td>
                <Td style={{ fontWeight: 500 }}>{stock.name}</Td>
                <Td>{stock.stock_exchange}</Td>
                <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                  {Number(stock.price.close).toFixed(2)}
                </Td>
                <Td style={{ textAlign: "right" }}>
                  <ChangeBadge $positive={isPositive}>
                    {isPositive ? "+" : ""}
                    {Number(stock.price.change).toFixed(2)}
                  </ChangeBadge>
                </Td>
                <Td style={{ textAlign: "right" }}>
                  <ChangeBadge $positive={isPositive}>
                    {isPositive ? "+" : ""}
                    {Number(stock.price.change_percent).toFixed(2)}%
                  </ChangeBadge>
                </Td>
                <Td style={{ textAlign: "right" }}>
                  <VolumeText>{formatVolume(Number(stock.price.volume))}</VolumeText>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
