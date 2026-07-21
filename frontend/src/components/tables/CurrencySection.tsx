import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useRates } from "../../hooks/useRates";
import { useCurrencies } from "../../hooks/useCurrency";
import { CurrencyTable } from "./CurrencyTable";
import { CurrencyFilter } from "./CurrencyFilter";

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

const DEFAULT_CURRENCIES = ["EUR", "USD", "CHF", "JPY", "CZK"];

export function CurrencySection() {
  const { t } = useTranslation();
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const { data: rates, isLoading: ratesLoading } = useRates();

  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(DEFAULT_CURRENCIES);

  const availableCurrencies = useMemo(() => {
    return (currencies ?? []).map((c) => c.code);
  }, [currencies]);

  const filteredRates = useMemo(() => {
    if (!rates) return null;
    return rates.filter((r) => selectedCurrencies.includes(r.code));
  }, [rates, selectedCurrencies]);

  if (currenciesLoading || ratesLoading) {
    return (
      <SectionWrapper>
        <LoadingText>{t("app.loading")}</LoadingText>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <SectionTitle>{t("currency.title")}</SectionTitle>
      <CurrencyFilter
        availableCurrencies={availableCurrencies}
        selectedCurrencies={selectedCurrencies}
        onSelectionChange={setSelectedCurrencies}
      />
      <CurrencyTable rates={filteredRates} />
    </SectionWrapper>
  );
}
