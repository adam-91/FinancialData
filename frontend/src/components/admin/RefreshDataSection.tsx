import { useState } from "react";
import { useTranslation } from "react-i18next";
import { refreshCompaniesData, refreshIndicesData } from "../../api/adminTickers";
import {
  Section,
  SectionTitle,
  Button,
  GhostButton,
  Message,
} from "./TickerFormStyles";
import { isAxiosError } from "axios";

export function RefreshDataSection() {
  const { t } = useTranslation();
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [indicesLoading, setIndicesLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );

  const handleCompanies = async () => {
    setMessage(null);
    setCompaniesLoading(true);
    try {
      await refreshCompaniesData();
      setMessage({ type: "success", text: t("admin.refreshCompaniesStarted") });
    } catch (err) {
      if (isAxiosError(err)) {
        setMessage({ type: "error", text: err.response?.data?.detail || t("admin.error") });
      } else {
        setMessage({ type: "error", text: t("admin.error") });
      }
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleIndices = async () => {
    setMessage(null);
    setIndicesLoading(true);
    try {
      await refreshIndicesData();
      setMessage({ type: "success", text: t("admin.refreshIndicesStarted") });
    } catch (err) {
      if (isAxiosError(err)) {
        setMessage({ type: "error", text: err.response?.data?.detail || t("admin.error") });
      } else {
        setMessage({ type: "error", text: t("admin.error") });
      }
    } finally {
      setIndicesLoading(false);
    }
  };

  return (
    <Section>
      <SectionTitle>{t("admin.updateData", "Update data")}</SectionTitle>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button type="button" onClick={handleCompanies} disabled={companiesLoading}>
          {companiesLoading ? t("admin.refreshing") : t("admin.refreshCompanies")}
        </Button>
        <GhostButton type="button" onClick={handleIndices} disabled={indicesLoading}>
          {indicesLoading ? t("admin.refreshing") : t("admin.refreshIndices")}
        </GhostButton>
      </div>
      {message && <Message $type={message.type}>{message.text}</Message>}
    </Section>
  );
}
