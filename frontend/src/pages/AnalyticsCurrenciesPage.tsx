import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCurrencies } from "../hooks/useCurrency";
import { Period } from "../types/index";
import {
  AnalyticsPageLayout,
  AnalyticsTile,
  AnalyticsTileTitle,
} from "../components/analytics/AnalyticsPageLayout";
import { CurrencyChartView } from "../components/analytics/CurrencyChartView";
import { CurrencyTableBody } from "../components/analytics/CurrencyTableBody";
import { CurrencySummaryTiles } from "../components/analytics/CurrencySummaryTiles";
import { CurrencyDailyChangeChart } from "../components/analytics/CurrencyDailyChangeChart";
import { CurrencyMovingAverageChart } from "../components/analytics/CurrencyMovingAverageChart";
import { CurrencyCorrelationChart } from "../components/analytics/CurrencyCorrelationChart";
import { MultiSelect } from "../components/ui/MultiSelect";

const DEFAULT_CURRENCIES = ["EUR", "USD"];

export function AnalyticsCurrenciesPage() {
  const { t } = useTranslation();
  const { data: currencies } = useCurrencies();
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(DEFAULT_CURRENCIES);
  const [period, setPeriod] = useState<Period>("1y");

  const currencyOptions = useMemo(() => {
    return (currencies ?? []).map((c) => ({
      value: c.code,
      label: `${c.code} - ${c.name}`,
    }));
  }, [currencies]);

  return (
    <AnalyticsPageLayout
      toolbar={
        <MultiSelect
          options={currencyOptions}
          selected={selectedCurrencies}
          onChange={(s) => setSelectedCurrencies(s.slice(0, 8))}
          placeholder={t("currency.selectCurrencies")}
          maxSelected={8}
        />
      }
      chart={
        <AnalyticsTile>
          <CurrencyChartView
            selectedCurrencies={selectedCurrencies}
            period={period}
            onPeriodChange={setPeriod}
          />
        </AnalyticsTile>
      }
      table={
        <AnalyticsTile>
          <AnalyticsTileTitle>{t("analytics.quotations")}</AnalyticsTileTitle>
          <CurrencyTableBody />
        </AnalyticsTile>
      }
      right={
        <>
          <AnalyticsTile>
            <AnalyticsTileTitle>{t("currency.overview")}</AnalyticsTileTitle>
            <CurrencySummaryTiles />
          </AnalyticsTile>
          <AnalyticsTile>
            <AnalyticsTileTitle>{t("currency.dailyChange")}</AnalyticsTileTitle>
            <CurrencyDailyChangeChart codes={selectedCurrencies} />
          </AnalyticsTile>
          <AnalyticsTile>
            <AnalyticsTileTitle>{t("currency.movingAverage")}</AnalyticsTileTitle>
            <CurrencyMovingAverageChart codes={selectedCurrencies} />
          </AnalyticsTile>
          <AnalyticsTile>
            <AnalyticsTileTitle>{t("currency.correlation")}</AnalyticsTileTitle>
            <CurrencyCorrelationChart codes={selectedCurrencies} />
          </AnalyticsTile>
        </>
      }
    />
  );
}
