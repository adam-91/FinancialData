import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDataHealthSummary, useAllIndicesHealth, useAllCompaniesHealth, useSchedulerInfo } from "../hooks/useDataHealth";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 24px;
`;

const CardTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CardValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
`;

const CardSubtitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Percentage = styled.span<{ $value: number }>`
  color: ${({ theme, $value }) =>
    $value >= 75 ? theme.colors.success : $value >= 50 ? theme.colors.warning : theme.colors.danger};
  font-weight: 600;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SelectGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ViewButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: white;
  }
`;

const LoadingMessage = styled.div`
  padding: 32px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const EmptyMessage = styled.div`
  padding: 32px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export function HealthcheckPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [entityType, setEntityType] = useState<"index" | "company">("index");

  const { data: summary, isLoading: summaryLoading } = useDataHealthSummary();
  const { data: indices, isLoading: indicesLoading } = useAllIndicesHealth();
  const { data: companies, isLoading: companiesLoading } = useAllCompaniesHealth();
  const { data: schedulerInfo, isLoading: schedulerLoading } = useSchedulerInfo();

  const entities = entityType === "index" ? indices : companies;
  const entitiesLoading = entityType === "index" ? indicesLoading : companiesLoading;

  const formatTime = (hour: number | null, minute: number | null): string => {
    if (hour === null || minute === null) return "-";
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const formatNextRun = (iso: string | null): string => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const jobName = (id: string) => t(`scheduler.jobs.${id}`, id);

  const jobSchedule = (entry: {
    trigger: string;
    day_of_week: string | null;
    hour: number | null;
    minute: number | null;
    interval_minutes?: number | null;
  }): string => {
    if (entry.trigger === "cron") {
      return `${t("scheduler.monFri", "Mon-Fri")} ${formatTime(entry.hour, entry.minute)}`;
    }
    if (entry.trigger === "interval") {
      return t("scheduler.trigger.interval", {
        minutes: entry.interval_minutes ?? 0,
      });
    }
    if (entry.trigger === "startup") {
      return t("scheduler.trigger.startup", "On application startup");
    }
    return t("scheduler.trigger.startup_manual", "On startup + manual (reset tracker)");
  };

  if (summaryLoading) {
    return <LoadingMessage>{t("common.loading", "Loading...")}</LoadingMessage>;
  }

  return (
    <PageContainer>
      <SummaryGrid>
        <SummaryCard>
          <CardTitle>{t("healthcheck.indicesWithData", "Indices with Data")}</CardTitle>
          <CardValue>
            {summary?.indices_with_data ?? 0} / {summary?.total_indices ?? 0}
          </CardValue>
          <CardSubtitle>
            <Percentage $value={summary?.indices_percent ?? 0}>
              {summary?.indices_percent.toFixed(1) ?? 0}%
            </Percentage>
          </CardSubtitle>
        </SummaryCard>

        <SummaryCard>
          <CardTitle>{t("healthcheck.companiesWithData", "Companies with Data")}</CardTitle>
          <CardValue>
            {summary?.companies_with_data ?? 0} / {summary?.total_companies ?? 0}
          </CardValue>
          <CardSubtitle>
            <Percentage $value={summary?.companies_percent ?? 0}>
              {summary?.companies_percent.toFixed(1) ?? 0}%
            </Percentage>
          </CardSubtitle>
        </SummaryCard>
      </SummaryGrid>

      <Section>
        <SectionHeader>
          <SectionTitle>{t("scheduler.title", "Scheduler")}</SectionTitle>
        </SectionHeader>
        {schedulerLoading ? (
          <LoadingMessage>{t("common.loading", "Loading...")}</LoadingMessage>
        ) : !schedulerInfo || schedulerInfo.entries.length === 0 ? (
          <EmptyMessage>{t("scheduler.empty", "No scheduled jobs")}</EmptyMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>{t("scheduler.job", "Job")}</Th>
                <Th>{t("scheduler.schedule", "Schedule")}</Th>
                <Th>{t("scheduler.nextRun", "Next run")}</Th>
              </tr>
            </thead>
            <tbody>
              {schedulerInfo.entries.map((entry) => (
                <tr key={entry.id}>
                  <Td>{jobName(entry.id)}</Td>
                  <Td>{jobSchedule(entry)}</Td>
                  <Td>{formatNextRun(entry.next_run)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>{t("healthcheck.dataDetails", "Data Details")}</SectionTitle>
          <SelectGroup>
            <Select value={entityType} onChange={(e) => setEntityType(e.target.value as "index" | "company")}>
              <option value="index">{t("healthcheck.indices", "Indices")}</option>
              <option value="company">{t("healthcheck.companies", "Companies")}</option>
            </Select>
          </SelectGroup>
        </SectionHeader>

        {entitiesLoading ? (
          <LoadingMessage>{t("common.loading", "Loading...")}</LoadingMessage>
        ) : !entities || entities.length === 0 ? (
          <EmptyMessage>{t("healthcheck.noData", "No data available")}</EmptyMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>{t("healthcheck.symbol", "Symbol")}</Th>
                <Th>{t("healthcheck.name", "Name")}</Th>
                <Th>{t("healthcheck.fromDate", "From Date")}</Th>
                <Th>{t("healthcheck.toDate", "To Date")}</Th>
                <Th>{t("healthcheck.records", "Records")}</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity.symbol}>
                  <Td>{entity.symbol}</Td>
                  <Td>{entity.name}</Td>
                  <Td>{entity.min_date ?? "-"}</Td>
                  <Td>{entity.max_date ?? "-"}</Td>
                  <Td>{entity.record_count}</Td>
                  <Td>
                    <ViewButton
                      onClick={() => navigate(`/raw-data/${entityType}/${encodeURIComponent(entity.symbol)}`)}
                      disabled={entity.record_count === 0}
                    >
                      {t("healthcheck.viewRawData", "View Raw Data")}
                    </ViewButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </PageContainer>
  );
}
