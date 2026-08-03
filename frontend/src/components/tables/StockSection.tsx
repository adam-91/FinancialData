import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useStockPrices } from "../../hooks/useStocks";
import { useIndices } from "../../hooks/useIndices";
import { StockTable } from "./StockTable";
import { StockFilter } from "./StockFilter";

const SectionWrapper = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 20px;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  padding: 40px;
  text-align: center;
`;

export function StockSection() {
  const { t } = useTranslation();
  const { data: stocks, isLoading: stocksLoading } = useStockPrices();
  const { data: indices, isLoading: indicesLoading } = useIndices();
  const [selectedIndex, setSelectedIndex] = useState<string>("^WIG20");

  const filteredStocks = useMemo(() => {
    if (!stocks) return [];
    if (selectedIndex === "all") return stocks;
    return stocks.filter((s) => s.indices.includes(selectedIndex));
  }, [stocks, selectedIndex]);

  if (stocksLoading || indicesLoading) {
    return (
      <SectionWrapper>
        <LoadingText>{t("app.loading")}</LoadingText>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <SectionTitle>{t("stocks.title")}</SectionTitle>
      <StockFilter
        indices={indices ?? []}
        selectedIndex={selectedIndex}
        onIndexChange={setSelectedIndex}
      />
      <StockTable stocks={filteredStocks} />
    </SectionWrapper>
  );
}
