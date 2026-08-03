import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ExchangeRate } from "../../types/currencyExchangeRate";

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

const CodeBadge = styled.span`
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

interface CurrencyTableProps {
  rates: ExchangeRate[] | null;
}

export function CurrencyTable({ rates }: CurrencyTableProps) {
  const { t } = useTranslation();

  return (
    <TableWrapper>
      <Table>
        <Thead>
          <tr>
            <Th>{t("currency.code")}</Th>
            <Th>{t("currency.name")}</Th>
            <Th>{t("currency.date")}</Th>
            <Th style={{ textAlign: "right" }}>{t("currency.midRate")}</Th>
            <Th style={{ textAlign: "right" }}>{t("currency.buyRate")}</Th>
            <Th style={{ textAlign: "right" }}>{t("currency.sellRate")}</Th>
          </tr>
        </Thead>
        <tbody>
          {rates?.map((rate) => {
            const code = rate.code;
            return (
              <Tr key={`${code}-${rate.effectiveDate}`}>
                <Td>
                  <CodeBadge>{code}</CodeBadge>
                </Td>
                <Td>{rate.currency}</Td>
                <Td>{rate.effectiveDate}</Td>
                <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 500 }}>
                  {rate.mid != null ? Number(rate.mid).toFixed(4) : "-"}
                </Td>
                <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 500 }}>
                  {rate.bid != null ? Number(rate.bid).toFixed(4) : "-"}
                </Td>
                <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 500 }}>
                  {rate.ask != null ? Number(rate.ask).toFixed(4) : "-"}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
