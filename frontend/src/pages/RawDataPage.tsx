import { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useRawData } from "../hooks/useRawData";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BackButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 24px;
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
  font-variant-numeric: tabular-nums;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, $disabled }) => ($disabled ? theme.colors.surfaceHover : "transparent")};
  color: ${({ theme, $disabled }) => ($disabled ? theme.colors.text.muted : theme.colors.text.primary)};
  font-size: 14px;
  font-weight: 500;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const PageInput = styled.input`
  width: 64px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const LoadingMessage = styled.div`
  padding: 32px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ErrorMessage = styled.div`
  padding: 32px;
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
`;

export function RawDataPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { entityType, symbol } = useParams<{ entityType: string; symbol: string }>();
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const pageSize = 50;

  const { data, isLoading, error } = useRawData(entityType || "", symbol || "", page, pageSize);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const goToPage = () => {
    const target = parseInt(pageInput, 10);
    if (Number.isNaN(target)) {
      setPageInput(String(page));
      return;
    }
    const clamped = Math.min(totalPages, Math.max(1, target));
    setPage(clamped);
    setPageInput(String(clamped));
  };

  if (isLoading) {
    return <LoadingMessage>{t("common.loading", "Loading...")}</LoadingMessage>;
  }

  if (error || !data) {
    return <ErrorMessage>{t("common.error", "Error loading data")}</ErrorMessage>;
  }

  return (
    <PageContainer>
      <Header>
        <TitleGroup>
          <Title>
            {data.symbol} - {data.name}
          </Title>
          <Subtitle>
            {t("rawData.totalRecords", "Total records")}: {data.total}
          </Subtitle>
        </TitleGroup>
        <BackButton onClick={() => navigate("/healthcheck")}>
          {t("rawData.backToHealthcheck", "Back to Healthcheck")}
        </BackButton>
      </Header>

      <Section>
        <Table>
          <thead>
            <tr>
              <Th>{t("rawData.date", "Date")}</Th>
              <Th>{t("rawData.open", "Open")}</Th>
              <Th>{t("rawData.high", "High")}</Th>
              <Th>{t("rawData.low", "Low")}</Th>
              <Th>{t("rawData.close", "Close")}</Th>
              <Th>{t("rawData.volume", "Volume")}</Th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((entry, index) => (
              <tr key={index}>
                <Td>{entry.trading_date}</Td>
                <Td>{Number(entry.open).toFixed(4)}</Td>
                <Td>{Number(entry.high).toFixed(4)}</Td>
                <Td>{Number(entry.low).toFixed(4)}</Td>
                <Td>{Number(entry.close).toFixed(4)}</Td>
                <Td>{Number(entry.volume).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Pagination>
          <PageInfo>
            {t("rawData.page", "Page")} {data.page} {t("rawData.of", "of")} {totalPages}
          </PageInfo>
          <ButtonGroup>
            <PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              {t("rawData.previous", "Previous")}
            </PageButton>
            <PageInput
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  goToPage();
                }
              }}
              aria-label={t("rawData.goToPage", "Go to page")}
            />
            <PageButton onClick={goToPage}>
              {t("rawData.go", "Go")}
            </PageButton>
            <PageButton onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              {t("rawData.next", "Next")}
            </PageButton>
          </ButtonGroup>
        </Pagination>
      </Section>
    </PageContainer>
  );
}
