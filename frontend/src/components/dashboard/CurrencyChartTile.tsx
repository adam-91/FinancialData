import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { useCurrencies } from "../../hooks/useCurrency";
import { getCurrencyHistory } from "../../api/currencyHistory";
import { Period } from "../../types/index";
import { TileWrapper } from "./TileWrapper";
import { PeriodSelector } from "../ui/PeriodSelector";
import { MultiSelect } from "../ui/MultiSelect";
import { MultiLineChart } from "../chart/MultiLineChart";

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  text-align: center;
  padding: 40px;
`;

const DEFAULT_CURRENCIES = ["EUR", "USD"];

export function CurrencyChartTile() {
  const { t } = useTranslation();
  const { data: currencies, isLoading } = useCurrencies();
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(DEFAULT_CURRENCIES);
  const [period, setPeriod] = useState<Period>("1y");

  const currencyOptions = useMemo(() => {
    return (currencies ?? []).map((c) => ({
      value: c.code,
      label: `${c.code} - ${c.name}`,
    }));
  }, [currencies]);

  const historyResults = useQueries({
    queries: selectedCurrencies.map((code) => ({
      queryKey: ["currencyHistory", code, period],
      queryFn: () => getCurrencyHistory(code, period),
      enabled: !!code,
    })),
  });

  const series = useMemo(() => {
    return selectedCurrencies.map((code, i) => {
      const data = historyResults[i]?.data?.data ?? [];
      return {
        label: code,
        data: data.map((d) => ({ time: d.time, value: d.mid })),
      };
    });
  }, [selectedCurrencies, historyResults]);

  if (isLoading) {
    return (
      <TileWrapper title={t("dashboard.tiles.currencyChart")}>
        <LoadingText>{t("app.loading")}</LoadingText>
      </TileWrapper>
    );
  }

  return (
    <TileWrapper title={t("dashboard.tiles.currencyChart")}>
      <Controls>
        <MultiSelect
          options={currencyOptions}
          selected={selectedCurrencies}
          onChange={(s) => setSelectedCurrencies(s.slice(0, 8))}
          placeholder={t("currency.selectCurrencies")}
          maxSelected={8}
        />
        <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
      </Controls>
      <MultiLineChart series={series} height={280} />
    </TileWrapper>
  );
}
