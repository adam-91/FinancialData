import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useLogs } from "../hooks/useLogs";
import type { LogsQueryParams } from "../api/logs";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  flex-wrap: wrap;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
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

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const SortButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accent : "transparent"};
  color: ${({ theme, $active }) =>
    $active ? "white" : theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme, $active }) =>
      $active ? "white" : theme.colors.accent};
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
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
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  vertical-align: top;
`;

const TimestampCell = styled(Td)`
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13px;
`;

const LevelBadge = styled.span<{ $level: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ theme, $level }) => {
    switch ($level) {
      case "DEBUG":
        return `
          background: ${theme.colors.surfaceHover};
          color: ${theme.colors.text.muted};
        `;
      case "INFO":
        return `
          background: ${theme.colors.accent}22;
          color: ${theme.colors.accent};
        `;
      case "WARNING":
        return `
          background: ${theme.colors.warningBg};
          color: ${theme.colors.warning};
        `;
      case "ERROR":
        return `
          background: ${theme.colors.dangerBg};
          color: ${theme.colors.danger};
        `;
      case "CRITICAL":
        return `
          background: ${theme.colors.danger};
          color: white;
        `;
      default:
        return `
          background: ${theme.colors.surfaceHover};
          color: ${theme.colors.text.primary};
        `;
    }
  }}
`;

const ModuleCell = styled(Td)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: monospace;
  white-space: nowrap;
`;

const MessageCell = styled(Td)`
  word-break: break-word;
  max-width: 500px;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PageButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ theme, $disabled }) =>
    $disabled ? theme.colors.border : theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: transparent;
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.text.muted : theme.colors.accent};
  font-size: 14px;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
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

const ExtraDetails = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-family: monospace;
`;

type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export function LogsPage() {
  const { t } = useTranslation();
  const [level, setLevel] = useState<LogLevel | "">("");
  const [module, setModule] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const params: LogsQueryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      level: level || undefined,
      module: module || undefined,
      search: search || undefined,
      sort_order: sortOrder,
    }),
    [page, level, module, search, sortOrder]
  );

  const { data, isLoading } = useLogs(params);

  const modules = useMemo(() => {
    if (!data?.logs) return [];
    const uniqueModules = new Set(data.logs.map((log) => log.logger_name));
    return Array.from(uniqueModules).sort();
  }, [data?.logs]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleString();
    } catch {
      return ts;
    }
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <PageContainer>
      <Section>
        <SectionHeader>
          <SectionTitle>{t("logs.title", "Application Logs")}</SectionTitle>
        </SectionHeader>

        <FiltersRow>
          <Select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value as LogLevel | "");
              handleFilterChange();
            }}
          >
            <option value="">{t("logs.allLevels", "All Levels")}</option>
            <option value="DEBUG">DEBUG</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </Select>

          <Select
            value={module}
            onChange={(e) => {
              setModule(e.target.value);
              handleFilterChange();
            }}
          >
            <option value="">{t("logs.allModules", "All Modules")}</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>

          <SearchInput
            type="text"
            placeholder={t("logs.searchPlaceholder", "Search messages...")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
          />

          <SortButton
            $active={sortOrder === "desc"}
            onClick={() => {
              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
              setPage(1);
            }}
          >
            {sortOrder === "desc"
              ? t("logs.newestFirst", "Newest First")
              : t("logs.oldestFirst", "Oldest First")}
          </SortButton>
        </FiltersRow>
      </Section>

      <Section>
        {isLoading ? (
          <LoadingMessage>{t("logs.loading", "Loading...")}</LoadingMessage>
        ) : !data || data.logs.length === 0 ? (
          <EmptyMessage>{t("logs.empty", "No logs found")}</EmptyMessage>
        ) : (
          <>
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>{t("logs.timestamp", "Timestamp")}</Th>
                    <Th>{t("logs.level", "Level")}</Th>
                    <Th>{t("logs.module", "Module")}</Th>
                    <Th>{t("logs.message", "Message")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.logs.map((log, idx) => (
                    <Tr key={`${log.timestamp}-${idx}`}>
                      <TimestampCell>
                        {formatTimestamp(log.timestamp)}
                      </TimestampCell>
                      <Td>
                        <LevelBadge $level={log.level}>
                          {log.level}
                        </LevelBadge>
                      </Td>
                      <ModuleCell>{log.logger_name}</ModuleCell>
                      <MessageCell>
                        {log.event}
                        {Object.keys(log.extra).length > 0 && (
                          <ExtraDetails>
                            {Object.entries(log.extra)
                              .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                              .join(", ")}
                          </ExtraDetails>
                        )}
                      </MessageCell>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <Pagination>
              <PageButton
                $disabled={page <= 1}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("logs.previous", "Previous")}
              </PageButton>
              <PageInfo>
                {t("logs.page", "Page")} {page} {t("logs.of", "of")}{" "}
                {totalPages}
              </PageInfo>
              <PageButton
                $disabled={page >= totalPages}
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              >
                {t("logs.next", "Next")}
              </PageButton>
            </Pagination>
          </>
        )}
      </Section>
    </PageContainer>
  );
}
