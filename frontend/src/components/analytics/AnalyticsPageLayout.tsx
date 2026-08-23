import styled from "styled-components";
import { ReactNode } from "react";

export const AnalyticsToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: 16px;
`;

export const AnalyticsColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const AnalyticsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const AnalyticsTile = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
`;

export const AnalyticsTileTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

interface AnalyticsPageLayoutProps {
  toolbar: ReactNode;
  chart: ReactNode;
  table: ReactNode;
}

export function AnalyticsPageLayout({ toolbar, chart, table }: AnalyticsPageLayoutProps) {
  return (
    <div>
      <AnalyticsToolbar>{toolbar}</AnalyticsToolbar>
      <AnalyticsColumns>
        <AnalyticsColumn>
          {chart}
          {table}
        </AnalyticsColumn>
        <AnalyticsColumn />
      </AnalyticsColumns>
    </div>
  );
}
