import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useIndices, useIndexHistory } from "../../hooks/useIndices";
import { StockChart } from "./StockChart";
import { ChartControls, ChartType } from "./ChartControls";

const SectionWrapper = styled.section`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  padding: 40px;
  text-align: center;
`;

export function ChartSection() {
  const { t } = useTranslation();
  const { data: indices, isLoading } = useIndices();
  const [selectedSymbol, setSelectedSymbol] = useState("^WIG20");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const { data: historyData } = useIndexHistory(selectedSymbol);

  if (isLoading) {
    return (
      <SectionWrapper>
        <LoadingText>{t("app.loading")}</LoadingText>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle>{t("chart.title")}</SectionTitle>
      </SectionHeader>
      <ChartControls
        indices={indices ?? []}
        selectedSymbol={selectedSymbol}
        chartType={chartType}
        onSymbolChange={setSelectedSymbol}
        onChartTypeChange={setChartType}
      />
      <div style={{ marginTop: "16px" }}>
        <StockChart data={historyData?.data ?? []} chartType={chartType} />
      </div>
    </SectionWrapper>
  );
}
