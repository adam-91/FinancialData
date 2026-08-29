import { useEffect, useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  listExchanges,
  createTicker,
  testYfinance,
  ExchangeOption,
  YfinanceTestResult,
} from "../../api/adminTickers";
import {
  Section,
  SectionTitle,
  FormRow,
  Field,
  Label,
  Input,
  Select,
  Button,
  GhostButton,
  ResultBox,
  Message,
} from "./TickerFormStyles";
import { isAxiosError } from "axios";

export function AddTickerSection() {
  const { t } = useTranslation();
  const [exchanges, setExchanges] = useState<ExchangeOption[]>([]);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [exchangeSymbol, setExchangeSymbol] = useState("");
  const [yahooSymbol, setYahooSymbol] = useState("");
  const [testResult, setTestResult] = useState<YfinanceTestResult | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForce, setShowForce] = useState(false);

  useEffect(() => {
    listExchanges()
      .then(setExchanges)
      .catch(() => setExchanges([]));
  }, []);

  const selectedExchange = exchanges.find((e) => e.symbol === exchangeSymbol);

  const resolvedYahooSymbol = (): string => {
    if (yahooSymbol.trim()) return yahooSymbol.trim();
    if (!selectedExchange?.ticker) return symbol.trim();
    return `${symbol.trim()}.${selectedExchange.ticker}`;
  };

  const handleTest = async () => {
    setTestResult(null);
    setMessage(null);
    setShowForce(false);
    setTesting(true);
    try {
      const result = await testYfinance(resolvedYahooSymbol());
      setTestResult(result);
    } catch (err) {
      if (isAxiosError(err)) {
        setMessage({ type: "error", text: err.response?.data?.detail || t("admin.error") });
      } else {
        setMessage({ type: "error", text: t("admin.error") });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleAdd = async (force: boolean) => {
    setMessage(null);
    setShowForce(false);
    setAdding(true);
    try {
      await createTicker(
        {
          symbol,
          name,
          exchange_symbol: exchangeSymbol,
          yahoo_symbol: resolvedYahooSymbol(),
          auto_fetch: true,
        },
        force
      );
      setSymbol("");
      setName("");
      setYahooSymbol("");
      setTestResult(null);
      setMessage({ type: "success", text: t("admin.tickerCreated") });
    } catch (err) {
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail || t("admin.error");
        if (err.response?.status === 400) {
          setMessage({ type: "error", text: detail });
          setShowForce(true);
        } else {
          setMessage({ type: "error", text: detail });
        }
      } else {
        setMessage({ type: "error", text: t("admin.error") });
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Section>
      <SectionTitle>{t("admin.addTicker", "Add company")}</SectionTitle>
      <FormRow
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          handleAdd(false);
        }}
      >
        <Field>
          <Label>{t("admin.symbol", "Symbol")}</Label>
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="PKN"
            required
          />
        </Field>
        <Field>
          <Label>{t("admin.name", "Name")}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Orlen"
            required
          />
        </Field>
        <Field>
          <Label>{t("admin.exchange", "Exchange")}</Label>
          <Select
            value={exchangeSymbol}
            onChange={(e) => setExchangeSymbol(e.target.value)}
            required
          >
            <option value="">{t("admin.selectExchange", "Select exchange")}</option>
            {exchanges.map((ex) => (
              <option key={ex.symbol} value={ex.symbol}>
                {ex.symbol}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>{t("admin.yahooSymbol", "Yahoo symbol")}</Label>
          <Input
            value={yahooSymbol}
            onChange={(e) => setYahooSymbol(e.target.value)}
            placeholder={selectedExchange?.ticker ? `${symbol || "PKN"}.${selectedExchange.ticker}` : symbol || "PKN"}
          />
        </Field>
        <GhostButton type="button" onClick={handleTest} disabled={testing}>
          {t("admin.testYfinance", "Test yFinance")}
        </GhostButton>
        <Button type="submit" disabled={adding}>
          {t("admin.add", "Add")}
        </Button>
      </FormRow>

      {testResult && (
        <ResultBox $found={testResult.found}>
          {testResult.found
            ? `${t("admin.yfinanceFound", "yFinance recognizes the symbol")} — ${testResult.symbol} (${t("admin.lastClose", "close")}: ${testResult.last_close}, ${testResult.last_date})`
            : `${t("admin.yfinanceNotFound", "yFinance does not recognize the symbol")}: ${testResult.symbol}`}
        </ResultBox>
      )}

      {message && <Message $type={message.type}>{message.text}</Message>}

      {showForce && (
        <GhostButton onClick={() => handleAdd(true)} disabled={adding}>
          {t("admin.addAnyway", "Add anyway")}
        </GhostButton>
      )}
    </Section>
  );
}
